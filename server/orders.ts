import { allRows, rowsForIds } from "./pagination.js";
import { randomUUID } from "node:crypto";
import type { Context } from "./auth.js";
import { check } from "./runtime.js";
import {
  HttpError,
  assertOwner,
  orderSchema,
  totalFor,
  renderTemplate,
  sha256,
} from "./policy.js";
import { money } from "../src/commerce/types.js";
export async function getOrder(ctx: Context, orderId: string) {
  const order = check(
    await ctx.db
      .from("client_orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle(),
  );
  if (!order) throw new HttpError(404, "Order not found");
  assertOwner(order.client_id, ctx.user.id, ctx.isAdmin);
  return order;
}
export async function event(
  ctx: Context,
  orderId: string,
  kind: string,
  title: string,
  detail = "",
  findings = "",
  outcome = "",
) {
  check(
    await ctx.db.from("order_events").insert({
      order_id: orderId,
      actor_id: ctx.user.id,
      kind,
      title,
      detail,
      findings,
      outcome,
    }),
  );
}
export async function agreementsReady(
  ctx: Context,
  orderId: string,
  kind?: string,
) {
  const order = await getOrder(ctx, orderId);
  if (order.item_snapshot.kind === "digital") return true;
  const docs = check(
    await ctx.db
      .from("order_documents")
      .select("*")
      .eq("order_id", orderId)
      .order("version", { ascending: false }),
  );
  for (const k of kind ? [kind] : ["nda", "contract"]) {
    const d = docs.find((x) => x.kind === k);
    if (!d || d.status !== "issued") return false;
    const signs = check(
      await ctx.db
        .from("document_signatures")
        .select("party,document_sha256")
        .eq("document_id", d.id),
    );
    if (
      !["client", "company"].every((p) =>
        signs.some((s) => s.party === p && s.document_sha256 === d.sha256),
      )
    )
      return false;
  }
  return true;
}
export async function createOrder(ctx: Context, body: unknown) {
  const b = orderSchema.parse(body);
  const existing = check(
    await ctx.db
      .from("client_orders")
      .select("id")
      .eq("client_id", ctx.user.id)
      .eq("request_key", b.request_key)
      .maybeSingle(),
  );
  if (existing) return existing;
  const allowed = check(
    await ctx.db.rpc("consume_api_limit", {
      p_key: `orders:${ctx.user.id}`,
      p_limit: 10,
      p_seconds: 3600,
    }),
  );
  if (!allowed)
    throw new HttpError(429, "Order limit reached. Please contact Capistor.");
  const item = check(
    await ctx.db
      .from("shop_items")
      .select("*")
      .eq("id", b.item_id)
      .eq("published", true)
      .maybeSingle(),
  );
  const settings = check(
    await ctx.db.from("business_settings").select("*").eq("id", true).single(),
  );
  if (
    !item ||
    !settings.legal_approved ||
    !settings.terms ||
    !settings.privacy ||
    !settings.refund_policy
  )
    throw new HttpError(
      409,
      "Online ordering is not open yet. Please contact Capistor for a proposal.",
    );
  if (!item.checkout_enabled && !item.requires_quote)
    throw new HttpError(409, "This item is not available to order yet");
  if (item.kind === "digital" && (!b.accept_license || !item.license_text))
    throw new HttpError(400, "Please review and accept the product licence");
  const templates = check(
    await ctx.db.from("legal_templates").select("*").eq("approved", true),
  );
  if (
    item.kind === "service" &&
    !["nda", "contract"].every((k) => templates.some((t) => t.id === k))
  )
    throw new HttpError(409, "Service agreements are not available yet");
  const assets =
    item.kind === "digital"
      ? check(
          await ctx.db
            .from("project_files")
            .select("id")
            .eq("item_id", item.id)
            .eq("status", "approved"),
        )
      : [];
  if (item.kind === "digital" && !assets.length)
    throw new HttpError(409, "The downloadable files are not available yet");
  const order = {
    id: randomUUID(),
    reference: `CAP-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`,
    client_id: ctx.user.id,
    item_id: item.id,
    item_snapshot: item,
    client_name: b.client_name,
    company: b.company,
    billing_address: b.billing_address,
    brief: b.brief,
    request_key: b.request_key,
    total_minor: totalFor(item.price_minor, item.tax_bps),
    currency: item.currency,
    status:
      item.kind === "digital"
        ? "awaiting_payment"
        : item.requires_quote
          ? "scoping"
          : "awaiting_agreement",
    accepted_terms:
      settings.terms + "\n\nREFUND POLICY\n" + settings.refund_policy,
    accepted_license: item.license_text,
  };
  const values = {
    company_name: settings.legal_name,
    company_address: settings.address,
    client_name: b.client_name,
    client_company: b.company || "Individual",
    client_address: b.billing_address,
    reference: order.reference,
    project_title: item.title,
    scope: item.scope,
    exclusions: item.exclusions,
    total: money(order.total_minor, item.currency),
    delivery_days: String(item.delivery_days),
    revisions: String(item.revision_limit),
    brief: b.brief,
  };
  const documents =
    item.kind === "service"
      ? templates.map((t) => {
          const content = renderTemplate(t.body, values);
          return {
            kind: t.id,
            title: t.title,
            body: content,
            sha256: sha256(content),
          };
        })
      : [];
  const orderId = check(
    await ctx.db.rpc("create_order_bundle", {
      p_order: order,
      p_documents: documents,
      p_files: assets.map((a) => a.id),
    }),
  );
  return { id: orderId };
}
const fileColumns =
  "id,filename,size_bytes,sha256,status,version_label,created_at,review_note,uploaded_by";
export async function detail(ctx: Context, orderId: string) {
  const order = await getOrder(ctx, orderId);
  const [events, files, allDocuments, payments, entitlements] =
    await Promise.all([
      allRows((from, to) =>
        ctx.db
          .from("order_events")
          .select("*")
          .eq("order_id", orderId)
          .order("created_at")
          .order("id")
          .range(from, to),
      ),
      allRows((from, to) =>
        ctx.db
          .from("project_files")
          .select(fileColumns)
          .eq("order_id", orderId)
          .order("created_at")
          .order("id")
          .range(from, to),
      ),
      allRows((from, to) =>
        ctx.db
          .from("order_documents")
          .select("*")
          .eq("order_id", orderId)
          .order("version")
          .order("id")
          .range(from, to),
      ),
      allRows((from, to) =>
        ctx.db
          .from("payment_attempts")
          .select("id,provider,state,created_at")
          .eq("order_id", orderId)
          .order("created_at")
          .order("id")
          .range(from, to),
      ),
      allRows((from, to) =>
        ctx.db
          .from("order_entitlements")
          .select("file_id")
          .eq("order_id", orderId)
          .order("file_id")
          .range(from, to),
      ),
    ]);
  const documents = allDocuments.filter(
    (d) => ctx.isAdmin || d.status !== "draft",
  );
  const signatures = await rowsForIds(
    documents.map((d) => d.id),
    (ids) =>
      allRows((from, to) =>
        ctx.db
          .from("document_signatures")
          .select("*")
          .in("document_id", ids)
          .order("id")
          .range(from, to),
      ),
  );
  const downloads =
    order.payment_status === "paid"
      ? await rowsForIds(
          entitlements.map((e) => e.file_id),
          (ids) =>
            allRows((from, to) =>
              ctx.db
                .from("project_files")
                .select(fileColumns)
                .in("id", ids)
                .eq("status", "approved")
                .order("id")
                .range(from, to),
            ),
        )
      : [];
  return {
    order,
    events,
    files,
    documents,
    signatures,
    payments,
    downloads,
    isAdmin: ctx.isAdmin,
  };
}
