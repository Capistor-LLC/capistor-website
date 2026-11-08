import type { IncomingMessage, ServerResponse } from "node:http";
import { z, ZodError } from "zod";
import { authenticate, administrator } from "./auth.js";
import { database, check } from "./runtime.js";
import { HttpError, id, text, csvCell } from "./policy.js";
import { createOrder, detail, getOrder, event } from "./orders.js";
import { beginPayment, stripeWebhook, btcWebhook } from "./payments.js";
import { prepareUpload, finishUpload, downloadFile } from "./files.js";
import {
  adminData,
  saveItem,
  saveSettings,
  saveTemplate,
  saveDocument,
  updateOrder,
  quoteOrder,
  confirmBank,
} from "./admin.js";
import { taxReadiness } from "./stripe-checkout.js";
import { paymentMode, requestOriginAllowed } from "./environment.js";

export const SIGNING_CONSENT =
  "I have read this complete document and agree to sign it electronically. I am authorised to sign for the named party. I understand that this signature applies only to the document version and SHA-256 fingerprint shown.";
const getActions = new Set([
  "catalog",
  "orders",
  "order",
  "export",
  "admin",
  "tax",
  "item-files",
]);
async function readBody(req: IncomingMessage) {
  let size = 0;
  const parts: Buffer[] = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) throw new HttpError(413, "Request is too large");
    parts.push(Buffer.from(chunk));
  }
  return Buffer.concat(parts);
}
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  const send = (status: number, data: unknown) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  try {
    const url = new URL(req.url || "", "http://internal");
    const action = url.searchParams.get("action") || "catalog";
    const webhook = action === "stripe-webhook" || action === "btcpay-webhook";
    if (req.method !== (getActions.has(action) ? "GET" : "POST"))
      throw new HttpError(405, "Method not allowed");
    if (
      req.method === "POST" &&
      !webhook &&
      !requestOriginAllowed(req.headers.origin)
    )
      throw new HttpError(403, "Request origin is not allowed");
    if (webhook) {
      const raw = await readBody(req);
      if (action === "stripe-webhook")
        await stripeWebhook(
          database(),
          raw,
          req.headers["stripe-signature"] as string,
        );
      else
        await btcWebhook(database(), raw, req.headers["btcpay-sig"] as string);
      return send(200, { received: true });
    }
    if (action === "catalog") {
      const db = database();
      const [items, business] = await Promise.all([
        db
          .from("shop_items")
          .select("*")
          .eq("published", true)
          .order("price_minor"),
        db.from("business_settings").select("*").eq("id", true).single(),
      ]);
      const b = check(business);
      const safe = { ...b };
      delete safe.updated_at;
      delete safe.id;
      if (!safe.license_redacted_confirmed) safe.license_url = "";
      if (!safe.legal_approved) {
        safe.terms = "";
        safe.privacy = "";
        safe.refund_policy = "";
      }
      if (paymentMode() === "test") {
        safe.bank_enabled = false;
        safe.btc_enabled = false;
      }
      return send(200, {
        items: check(items),
        business: safe,
        available: true,
        sandbox: paymentMode() === "test",
      });
    }
    const ctx = await authenticate(req.headers.authorization);
    const queryId = () => id.parse(url.searchParams.get("id"));
    const raw = req.method === "POST" ? await readBody(req) : null;
    let body: unknown = {};
    if (raw) {
      try {
        body = JSON.parse(raw.toString());
      } catch {
        throw new HttpError(400, "Invalid JSON");
      }
    }
    let result: unknown;
    switch (action) {
      case "orders":
        result = check(
          await ctx.db
            .from("client_orders")
            .select("*")
            .eq("client_id", ctx.user.id)
            .order("created_at", { ascending: false })
            .limit(200),
        );
        break;
      case "order":
        result = await detail(ctx, queryId());
        break;
      case "create-order":
        result = await createOrder(ctx, body);
        break;
      case "payment": {
        const b = z
          .object({
            order_id: id,
            provider: z.enum(["stripe", "bank", "btcpay"]),
          })
          .parse(body);
        result = await beginPayment(ctx, b.order_id, b.provider);
        break;
      }
      case "upload":
        result = await prepareUpload(ctx, body);
        break;
      case "finish-upload":
        result = await finishUpload(
          ctx,
          z.object({ file_id: id }).parse(body).file_id,
        );
        break;
      case "download": {
        const b = z
          .object({ file_id: id, review: z.boolean().default(false) })
          .parse(body);
        result = await downloadFile(ctx, b.file_id, b.review);
        break;
      }
      case "sign": {
        const b = z
          .object({
            document_id: id,
            name: text(150),
            sha256: z.string().regex(/^[a-f0-9]{64}$/),
            consent: z.literal(true),
          })
          .parse(body);
        const d = check(
          await ctx.db
            .from("order_documents")
            .select("*")
            .eq("id", b.document_id)
            .single(),
        );
        await getOrder(ctx, d.order_id);
        check(
          await ctx.db.rpc("sign_order_document", {
            p_document: b.document_id,
            p_user: ctx.user.id,
            p_name: b.name,
            p_email: ctx.user.email,
            p_party: ctx.isAdmin ? "company" : "client",
            p_hash: b.sha256,
            p_consent: SIGNING_CONSENT,
          }),
        );
        result = { ok: true };
        break;
      }
      case "message": {
        const b = z.object({ order_id: id, message: text(10000) }).parse(body);
        const o = await getOrder(ctx, b.order_id);
        if (o.status === "cancelled")
          throw new HttpError(409, "Order is closed");
        await event(
          ctx,
          b.order_id,
          "message",
          ctx.isAdmin ? "Message from Capistor" : "Message from client",
          b.message,
        );
        result = { ok: true };
        break;
      }
      case "export": {
        const data = await detail(ctx, queryId());
        const format = url.searchParams.get("format");
        res.statusCode = 200;
        if (format === "csv") {
          res.setHeader("Content-Type", "text/csv; charset=utf-8");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${data.order.reference}-history.csv"`,
          );
          res.end(
            [
              ["Date (UTC)", "Kind", "Title", "Detail", "Findings", "Outcome"],
              ...data.events.map((e) => [
                e.created_at,
                e.kind,
                e.title,
                e.detail,
                e.findings,
                e.outcome,
              ]),
            ]
              .map((row) => row.map(csvCell).join(","))
              .join("\r\n"),
          );
        } else {
          res.setHeader("Content-Type", "application/json");
          res.setHeader(
            "Content-Disposition",
            `attachment; filename="${data.order.reference}-record.json"`,
          );
          res.end(
            JSON.stringify(
              { exported_at: new Date().toISOString(), ...data },
              null,
              2,
            ),
          );
        }
        return;
      }
      case "rebuild": {
        administrator(ctx);
        const hook = process.env.VERCEL_DEPLOY_HOOK;
        if (!hook) {
          result = { configured: false };
          break;
        }
        const target = new URL(hook);
        if (
          target.origin !== "https://api.vercel.com" ||
          !target.pathname.startsWith("/v1/integrations/deploy/")
        )
          throw new HttpError(
            503,
            "The rebuild hook is not configured correctly",
          );
        const allowed = check(
          await ctx.db.rpc("consume_api_limit", {
            p_key: "site-rebuild",
            p_limit: 6,
            p_seconds: 3600,
          }),
        );
        if (!allowed)
          throw new HttpError(
            429,
            "A rebuild was already requested recently. Your content is saved; try rebuilding later.",
          );
        const response = await fetch(target, {
          method: "POST",
          redirect: "error",
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok)
          throw new HttpError(
            502,
            "Content is saved, but rebuilding public HTML failed",
          );
        result = { configured: true };
        break;
      }
      case "admin":
        result = await adminData(ctx);
        break;
      case "tax":
        administrator(ctx);
        result = await taxReadiness();
        break;
      case "save-item":
        result = await saveItem(ctx, body);
        break;
      case "save-settings":
        result = await saveSettings(ctx, body);
        break;
      case "save-template":
        result = await saveTemplate(ctx, body);
        break;
      case "save-document":
        result = await saveDocument(ctx, body);
        break;
      case "update-order":
        result = await updateOrder(ctx, body);
        break;
      case "quote":
        result = await quoteOrder(ctx, body);
        break;
      case "confirm-bank":
        result = await confirmBank(ctx, body);
        break;
      case "item-files":
        administrator(ctx);
        result = check(
          await ctx.db
            .from("project_files")
            .select(
              "id,filename,size_bytes,sha256,status,version_label,created_at,review_note,uploaded_by",
            )
            .eq("item_id", queryId())
            .order("created_at"),
        );
        break;
      case "review-file": {
        administrator(ctx);
        const b = z
          .object({
            file_id: id,
            status: z.enum(["approved", "rejected"]),
            review_note: text(2000),
            scanned: z.literal(true),
          })
          .parse(body);
        const f = check(
          await ctx.db
            .from("project_files")
            .select("*")
            .eq("id", b.file_id)
            .single(),
        );
        if (f.status === "uploading")
          throw new HttpError(409, "Upload is not complete");
        check(
          await ctx.db
            .from("project_files")
            .update({
              status: b.status,
              review_note: b.review_note,
              reviewed_by: ctx.user.id,
              reviewed_at: new Date().toISOString(),
            })
            .eq("id", f.id),
        );
        if (f.order_id)
          await event(
            ctx,
            f.order_id,
            "file",
            b.status === "approved" ? "File released" : "File rejected",
            `${f.filename}: ${b.review_note}`,
          );
        result = { ok: true };
        break;
      }
      default:
        throw new HttpError(404, "Endpoint not found");
    }
    send(200, result);
  } catch (error) {
    if (error instanceof ZodError)
      return send(400, {
        error: error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      });
    if (error instanceof HttpError)
      return send(error.status, { error: error.message });
    console.error(
      "Commerce request failed",
      error instanceof Error ? error.name : "Unknown",
    );
    send(500, {
      error:
        "We could not complete this request. Please try again or contact Capistor with your order reference.",
    });
  }
}
