import { database, check } from "./runtime.js";
import { HttpError, assertAdmin } from "./policy.js";
export async function authenticate(authorization: string | undefined) {
  const token = authorization?.match(/^Bearer ([A-Za-z0-9._-]+)$/)?.[1];
  if (!token) throw new HttpError(401, "Please sign in");
  const db = database();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user || !data.user.email_confirmed_at)
    throw new HttpError(401, "A verified account is required");
  const payload = JSON.parse(
    Buffer.from(token.split(".")[1], "base64url").toString(),
  );
  // Token is decoded only after Supabase verifies its signature and user status.
  const staff = check(
    await db
      .from("staff_members")
      .select("user_id,role,active")
      .eq("user_id", data.user.id)
      .maybeSingle(),
  );
  const ctx = {
    db,
    user: data.user,
    aal: String(payload.aal ?? "aal1"),
    role: staff?.active ? String(staff.role) : null,
    isAdmin: !!staff?.active && payload.aal === "aal2",
  };
  const allowed = check(
    await db.rpc("consume_api_limit", {
      p_key: `api:${ctx.user.id}`,
      p_limit: 120,
      p_seconds: 60,
    }),
  );
  if (!allowed)
    throw new HttpError(429, "Too many requests. Please wait a minute.");
  return ctx;
}
export type Context = Awaited<ReturnType<typeof authenticate>>;
export function administrator(ctx: Context) {
  assertAdmin(ctx.isAdmin, ctx.aal);
}
export function staffRole(ctx: Context, allowed: string[]) {
  administrator(ctx);
  if (!ctx.role || !allowed.includes(ctx.role))
    throw new HttpError(403, "Your staff role does not allow this action");
}
