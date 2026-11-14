import { z } from "zod";
import type { Context } from "./auth.js";
import { administrator, staffRole } from "./auth.js";
import { check } from "./runtime.js";
import { HttpError, id, text } from "./policy.js";
import { event, getOrder } from "./orders.js";

const OWNER_EMAIL = "krish.shoaib55@gmail.com";
const staffRoles = z.enum([
  "owner",
  "admin",
  "sales",
  "engineer",
  "support",
  "editor",
]);

export async function bootstrapOwner(ctx: Context) {
  if (ctx.user.email?.toLowerCase() !== OWNER_EMAIL || !ctx.user.email_confirmed_at)
    throw new HttpError(403, "This verified account is not the designated owner account");
  check(
    await ctx.db.from("staff_members").upsert({
      user_id: ctx.user.id,
      email: OWNER_EMAIL,
      display_name: "Shoaib Mustafa",
      role: "owner",
      active: true,
      updated_at: new Date().toISOString(),
    }),
  );
  return { ok: true };
}

function owner(ctx: Context) {
  administrator(ctx);
  if (ctx.role !== "owner")
    throw new HttpError(403, "Only the owner can manage staff access");
}

export async function listStaff(ctx: Context) {
  staffRole(ctx, ["owner", "admin"]);
  return check(
    await ctx.db
      .from("staff_members")
      .select("user_id,email,display_name,role,active,created_at")
      .order("created_at"),
  );
}

export async function saveStaff(ctx: Context, body: unknown) {
  owner(ctx);
  const b = z
    .object({
      email: z.string().email().transform((v) => v.toLowerCase()),
      display_name: text(150),
      role: staffRoles,
      active: z.boolean(),
    })
    .parse(body);
  if (b.email === OWNER_EMAIL && (b.role !== "owner" || !b.active))
    throw new HttpError(409, "The designated owner account cannot be disabled or demoted here");
  const listed = await ctx.db.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listed.error) throw listed.error;
  let user = listed.data.users.find((u) => u.email?.toLowerCase() === b.email);
  let invited = false;
  if (!user) {
    const invite = await ctx.db.auth.admin.inviteUserByEmail(b.email, {
      data: { display_name: b.display_name },
    });
    if (invite.error) throw invite.error;
    user = invite.data.user;
    invited = true;
  }
  check(
    await ctx.db.from("staff_members").upsert({
      user_id: user.id,
      email: b.email,
      display_name: b.display_name,
      role: b.role,
      active: b.active,
      invited_by: ctx.user.id,
      updated_at: new Date().toISOString(),
    }),
  );
  return { ok: true, invited };
}

export async function customerSummaries(ctx: Context) {
  staffRole(ctx, ["owner", "admin", "sales", "support"]);
  const [profilesResult, eventsResult, ordersResult, supportResult, itemsResult] =
    await Promise.all([
      ctx.db.from("customer_profiles").select("*").order("created_at", { ascending: false }).limit(500),
      ctx.db.from("customer_events").select("user_id,event_type,item_id,metadata,created_at").not("user_id", "is", null).order("created_at").limit(10000),
      ctx.db.from("client_orders").select("client_id,payment_status").limit(5000),
      ctx.db.from("support_cases").select("order_id,case_type").in("case_type", ["refund", "dispute"]).limit(5000),
      ctx.db.from("shop_items").select("id,title").limit(1000),
    ]);
  const profiles = check(profilesResult);
  const events = check(eventsResult);
  const orders = check(ordersResult);
  const support = check(supportResult);
  const itemNames = new Map(check(itemsResult).map((i) => [i.id, i.title]));
  const orderIds = check(
    await ctx.db.from("client_orders").select("id,client_id").limit(5000),
  );
  const clientByOrder = new Map(orderIds.map((o) => [o.id, o.client_id]));
  return profiles.map((p) => {
    const activity = events.filter((e) => e.user_id === p.user_id);
    const purchases = orders.filter((o) => o.client_id === p.user_id);
    const cases = support.filter((s) => clientByOrder.get(s.order_id) === p.user_id);
    return {
      ...p,
      visits: activity.filter((e) => e.event_type === "visit").length,
      product_views: activity.filter((e) => e.event_type === "product_view").length,
      checkout_starts: activity.filter((e) => e.event_type === "checkout_start").length,
      checkout_abandoned: activity.filter((e) => e.event_type === "checkout_abandoned").length,
      last_dropoff_stage: String(
        [...activity]
          .reverse()
          .find((e) => e.event_type === "checkout_abandoned")?.metadata?.stage || "",
      ),
      recent_products: [
        ...new Set(
          [...activity]
            .reverse()
            .map((e) => itemNames.get(e.item_id))
            .filter(Boolean),
        ),
      ].slice(0, 5),
      orders: purchases.length,
      paid_orders: purchases.filter((o) => o.payment_status === "paid").length,
      refunds: cases.filter((s) => s.case_type === "refund").length,
      disputes: cases.filter((s) => s.case_type === "dispute").length,
    };
  });
}

export async function recordNegotiation(ctx: Context, body: unknown) {
  const b = z
    .object({
      order_id: id,
      document_id: id.nullable().optional(),
      document_kind: z.enum(["nda", "contract"]),
      event_type: z.enum(["commented", "objected", "accepted", "decision"]),
      clause_key: z.string().max(120).default(""),
      message: text(10000),
      previous_text: z.string().max(40000).default(""),
      proposed_text: z.string().max(40000).default(""),
      decision: z.string().max(10000).default(""),
    })
    .parse(body);
  await getOrder(ctx, b.order_id);
  if (ctx.isAdmin) {
    if (["accepted", "decision"].includes(b.event_type))
      staffRole(ctx, ["owner", "admin", "sales"]);
    else staffRole(ctx, ["owner", "admin", "sales", "engineer"]);
  }
  check(
    await ctx.db.from("document_negotiation_events").insert({
      ...b,
      document_id: b.document_id || null,
      actor_id: ctx.user.id,
      actor_party: ctx.isAdmin ? "company" : "client",
    }),
  );
  await event(
    ctx,
    b.order_id,
    "negotiation",
    `${b.document_kind.toUpperCase()} ${b.event_type}`,
    b.message,
    b.clause_key,
    b.decision,
  );
  return { ok: true };
}

export async function listCalendar(ctx: Context) {
  staffRole(ctx, ["owner", "admin", "sales", "support", "engineer"]);
  const [slots, appointments] = await Promise.all([
    ctx.db.from("availability_slots").select("*").order("starts_at").gte("ends_at", new Date().toISOString()).limit(500),
    ctx.db.from("appointments").select("*").order("starts_at").gte("ends_at", new Date(Date.now() - 86400000).toISOString()).limit(500),
  ]);
  return { slots: check(slots), appointments: check(appointments) };
}

export async function addAvailability(ctx: Context, body: unknown) {
  staffRole(ctx, ["owner", "admin", "sales"]);
  const b = z
    .object({ starts_at: z.string().datetime(), ends_at: z.string().datetime() })
    .parse(body);
  if (new Date(b.ends_at) <= new Date(b.starts_at) || new Date(b.starts_at) <= new Date())
    throw new HttpError(400, "Choose a future time with an end after the start");
  return check(
    await ctx.db
      .from("availability_slots")
      .insert({ ...b, created_by: ctx.user.id })
      .select("*")
      .single(),
  );
}

export async function availableSlots(ctx: Context, orderId: string) {
  const order = await getOrder(ctx, orderId);
  if (!order.item_snapshot.booking_required)
    throw new HttpError(409, "This order does not require an appointment");
  return check(
    await ctx.db
      .from("availability_slots")
      .select("id,starts_at,ends_at")
      .eq("status", "open")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(60),
  );
}

export async function bookAppointment(ctx: Context, body: unknown) {
  const b = z
    .object({ order_id: id, slot_id: id, timezone: text(100) })
    .parse(body);
  await getOrder(ctx, b.order_id);
  const appointmentId = check(
    await ctx.db.rpc("book_consultation", {
      p_order: b.order_id,
      p_slot: b.slot_id,
      p_user: ctx.user.id,
      p_timezone: b.timezone,
    }),
  );
  return { id: appointmentId };
}

export async function updateAppointment(ctx: Context, body: unknown) {
  staffRole(ctx, ["owner", "admin", "sales", "support"]);
  const b = z
    .object({
      id,
      meeting_url: z.string().url().max(2000).or(z.literal("")),
      status: z.enum(["scheduled", "completed", "cancelled", "no_show"]),
      notes: z.string().max(5000),
    })
    .parse(body);
  const appointment = check(
    await ctx.db.from("appointments").select("*").eq("id", b.id).single(),
  );
  check(
    await ctx.db
      .from("appointments")
      .update({ ...b, updated_at: new Date().toISOString() })
      .eq("id", b.id),
  );
  await event(ctx, appointment.order_id, "appointment", "Appointment updated", b.status, "", b.notes);
  return { ok: true };
}

export async function createSupportCase(ctx: Context, body: unknown) {
  const b = z
    .object({
      order_id: id,
      case_type: z.enum(["support", "refund", "return", "engineering_flaw", "dispute"]),
      subject: text(200),
      detail: text(20000),
      requested_remedy: z.string().max(5000),
    })
    .parse(body);
  await getOrder(ctx, b.order_id);
  const result = check(
    await ctx.db
      .from("support_cases")
      .insert({ ...b, opened_by: ctx.user.id })
      .select("*")
      .single(),
  );
  await event(ctx, b.order_id, "support", "Support ticket opened", `${b.case_type}: ${b.subject}`, b.detail, b.requested_remedy);
  return result;
}

export async function updateSupportCase(ctx: Context, body: unknown) {
  staffRole(ctx, ["owner", "admin", "support"]);
  const b = z
    .object({
      id,
      status: z.enum(["open", "investigating", "waiting_customer", "approved", "resolved", "rejected", "closed"]),
      decision: z.string().max(20000),
    })
    .parse(body);
  const current = check(
    await ctx.db.from("support_cases").select("*").eq("id", b.id).single(),
  );
  check(
    await ctx.db
      .from("support_cases")
      .update({ ...b, updated_at: new Date().toISOString() })
      .eq("id", b.id),
  );
  await event(ctx, current.order_id, "support", "Support ticket updated", b.status, "", b.decision);
  return { ok: true };
}
