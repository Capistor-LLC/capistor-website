import { z } from "zod";
import type { Context } from "./auth.js";
import { administrator, staffRole } from "./auth.js";
import { check, env } from "./runtime.js";
import {
  HttpError,
  itemSchema,
  id,
  text,
  sha256,
  transitionAllowed,
} from "./policy.js";
import { getOrder, agreementsReady } from "./orders.js";
import { stripe } from "./runtime.js";
import { taxReadiness } from "./stripe-checkout.js";
import { NDA_TEMPLATE, CONTRACT_TEMPLATE } from "./documents.js";
import { assertPaymentEnvironment } from "./environment.js";
export async function adminData(ctx: Context) {
  administrator(ctx);
  const [items, orders, settings, templates] = await Promise.all([
    ctx.db.from("shop_items").select("*").order("created_at"),
    ctx.db
      .from("client_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    ctx.db.from("business_settings").select("*").eq("id", true).single(),
    ctx.db.from("legal_templates").select("*"),
  ]);
  return {
    items: check(items),
    orders: ["owner", "admin", "sales", "engineer", "support"].includes(
      ctx.role || "",
    )
      ? check(orders)
      : [],
    settings: check(settings),
    templates: ["owner", "admin", "sales", "engineer"].includes(
      ctx.role || "",
    )
      ? check(templates)
      : [],
    role: ctx.role,
    defaults: { nda: NDA_TEMPLATE, contract: CONTRACT_TEMPLATE },
    configured: ["owner", "admin"].includes(ctx.role || "") ? {
      bank: !!process.env.BANK_DETAILS_JSON,
      stripe: !!(
        process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET
      ),
      btcpay: !!(
        process.env.BTCPAY_URL &&
        process.env.BTCPAY_API_KEY &&
        process.env.BTCPAY_STORE_ID &&
        process.env.BTCPAY_WEBHOOK_SECRET
      ),
      storage: !!(
        process.env.R2_ACCOUNT_ID &&
        process.env.R2_BUCKET &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY
      ),
    } : {},
  };
}
function finalized(body: string) {
  if (
    /owner must specify|to be agreed before issue|\[INSERT|\[TODO/i.test(body)
  )
    throw new HttpError(
      400,
      "Complete the project-specific clauses before approving or issuing this document",
    );
}
export async function saveItem(ctx: Context, body: unknown) {
  staffRole(ctx, ["owner", "admin", "editor"]);
  const b = itemSchema.parse(body);
  if (b.tax_mode !== "manual" && b.tax_bps !== 0)
    throw new HttpError(400, "Only manual tax can have a manual rate");
  if (b.tax_mode === "automatic") {
    if (!b.tax_code || !(await taxReadiness()).active)
      throw new HttpError(
        400,
        "Configure Tax registration and choose a tax code first",
      );
    await stripe().taxCodes.retrieve(b.tax_code);
  }
  if (
    b.kind === "digital" &&
    b.published &&
    (!b.license_text || b.requires_quote)
  )
    throw new HttpError(
      400,
      "Published digital products need a licence and fixed pricing",
    );
  if (b.checkout_enabled && b.kind === "digital") {
    if (!b.id)
      throw new HttpError(
        400,
        "Save the product and attach its files before enabling checkout",
      );
    const assets = check(
      await ctx.db
        .from("project_files")
        .select("id")
        .eq("item_id", b.id)
        .eq("status", "approved"),
    );
    if (!assets.length)
      throw new HttpError(
        400,
        "Approve a downloadable file before enabling checkout",
      );
  }
  return check(
    await ctx.db
      .from("shop_items")
      .upsert({ ...b, updated_at: new Date().toISOString() })
      .select("*")
      .single(),
  );
}
const safeUrl = z
  .string()
  .max(2000)
  .refine(
    (v) =>
      !v || /^https:\/\//.test(v) || (v.startsWith("/") && !v.startsWith("//")),
    "Use HTTPS or a local path",
  );
const settingsSchema = z.object({
  legal_name: text(200),
  contact_email: z.string().email(),
  address: text(1000),
  registration_number: z.string().max(100),
  verification_url: safeUrl,
  portrait_url: safeUrl,
  license_url: safeUrl,
  license_redacted_confirmed: z.boolean(),
  terms: z.string().max(40000),
  privacy: z.string().max(40000),
  refund_policy: z.string().max(20000),
  legal_approved: z.boolean(),
  bank_enabled: z.boolean(),
  stripe_enabled: z.boolean(),
  btc_enabled: z.boolean(),
  fiverr_enabled: z.boolean(),
});
export async function saveSettings(ctx: Context, body: unknown) {
  staffRole(ctx, ["owner", "admin"]);
  const b = settingsSchema.parse(body);
  if (b.license_url && !b.license_redacted_confirmed)
    throw new HttpError(
      400,
      "Confirm that the public licence copy is redacted",
    );
  if (b.legal_approved) {
    if (!b.terms || !b.privacy || !b.refund_policy)
      throw new HttpError(400, "Complete all customer policies");
    [b.terms, b.privacy, b.refund_policy].forEach(finalized);
  }
  if (b.bank_enabled) env("BANK_DETAILS_JSON");
  if (b.stripe_enabled) {
    env("STRIPE_SECRET_KEY");
    env("STRIPE_WEBHOOK_SECRET");
  }
  if (b.btc_enabled) {
    env("BTCPAY_URL");
    env("BTCPAY_API_KEY");
    env("BTCPAY_WEBHOOK_SECRET");
    env("BTCPAY_STORE_ID");
  }
  check(
    await ctx.db
      .from("business_settings")
      .update({ ...b, updated_at: new Date().toISOString() })
      .eq("id", true),
  );
  return { ok: true };
}
export async function saveTemplate(ctx: Context, body: unknown) {
  staffRole(ctx, ["owner", "admin"]);
  const b = z
    .object({
      id: z.enum(["nda", "contract"]),
      title: text(200),
      body: text(40000),
      approved: z.boolean(),
    })
    .parse(body);
  if (b.approved) finalized(b.body);
  check(
    await ctx.db
      .from("legal_templates")
      .upsert({ ...b, updated_at: new Date().toISOString() }),
  );
  return { ok: true };
}
export async function saveDocument(ctx: Context, body: unknown) {
  staffRole(ctx, ["owner", "admin", "sales", "engineer"]);
  const b = z
    .object({
      order_id: id,
      kind: z.enum(["nda", "contract"]),
      title: text(200),
      body: text(40000),
      issue: z.boolean(),
    })
    .parse(body);
  const order = await getOrder(ctx, b.order_id);
  if (["cancelled", "completed"].includes(order.status))
    throw new HttpError(409, "Order closed");
  if (b.issue) finalized(b.body);
  const docId = check(
    await ctx.db.rpc("issue_order_document", {
      p_order: b.order_id,
      p_kind: b.kind,
      p_title: b.title,
      p_body: b.body,
      p_hash: sha256(b.body),
      p_issue: b.issue,
      p_actor: ctx.user.id,
    }),
  );
  return { id: docId };
}

export async function updateOrder(ctx: Context, body: unknown) {
  staffRole(ctx, ["owner", "admin", "engineer", "support"]);
  const b = z
    .object({
      order_id: id,
      title: text(200),
      detail: z.string().max(20000),
      findings: z.string().max(20000),
      outcome: z.string().max(20000),
      status: z.string().optional(),
      due_at: z.string().datetime().nullable().optional(),
    })
    .parse(body);
  const o = await getOrder(ctx, b.order_id);
  if (b.status && b.status !== o.status) {
    if (!transitionAllowed(o.status, b.status))
      throw new HttpError(409, "This status transition is not allowed");
    if (b.status === "awaiting_payment" && !(await agreementsReady(ctx, o.id)))
      throw new HttpError(409, "Both agreements need both signatures");
    if (
      ["client_review", "completed"].includes(b.status) &&
      o.payment_status !== "paid"
    )
      throw new HttpError(409, "Payment is not confirmed");
    if (b.status === "cancelled" && o.payment_status === "paid")
      throw new HttpError(409, "Reconcile the payment before cancellation");
  }
  check(
    await ctx.db.rpc("publish_order_update", {
      p_order: o.id,
      p_actor: ctx.user.id,
      p_title: b.title,
      p_detail: b.detail,
      p_findings: b.findings,
      p_outcome: b.outcome,
      p_status: b.status ?? o.status,
      p_due: b.due_at === undefined ? o.due_at : b.due_at,
    }),
  );
  return { ok: true };
}

export async function quoteOrder(ctx: Context, body: unknown) {
  staffRole(ctx, ["owner", "admin", "sales"]);
  const b = z
    .object({
      order_id: id,
      price_minor: z.number().int().min(100).max(100000000),
      tax_bps: z.number().int().min(0).max(2500),
      scope: text(),
      exclusions: text(),
      delivery_days: z.number().int().min(1).max(365),
      revision_limit: z.number().int().min(0).max(20),
    })
    .parse(body);
  const o = await getOrder(ctx, b.order_id);
  if (
    !["received", "scoping", "awaiting_agreement"].includes(o.status) ||
    o.payment_status !== "unpaid"
  )
    throw new HttpError(409, "This order can no longer be repriced");
  if (o.item_snapshot.tax_mode === "automatic" && b.tax_bps !== 0)
    throw new HttpError(400, "Do not combine manual and automatic tax");
  check(
    await ctx.db.rpc("quote_order", {
      p_order: o.id,
      p_quote: {
        ...b,
        tax_mode:
          o.item_snapshot.tax_mode === "automatic"
            ? "automatic"
            : b.tax_bps
              ? "manual"
              : "none",
      },
      p_actor: ctx.user.id,
    }),
  );
  return { ok: true };
}

export async function confirmBank(ctx: Context, body: unknown) {
  staffRole(ctx, ["owner", "admin"]);
  assertPaymentEnvironment("bank");
  const b = z
    .object({
      order_id: id,
      bank_reference: text(200),
      amount_minor: z.number().int().positive(),
      currency: z.enum(["USD", "AED", "EUR", "GBP"]),
      funds_received: z.literal(true),
    })
    .parse(body);
  const o = await getOrder(ctx, b.order_id);
  check(
    await ctx.db.rpc("settle_order", {
      p_order: o.id,
      p_provider: "bank",
      p_event: b.bank_reference,
      p_identity: b.bank_reference,
      p_amount: b.amount_minor,
      p_currency: b.currency,
      p_actor: ctx.user.id,
    }),
  );
  return { ok: true };
}
