import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const id = z.string().uuid();
export const text = (max = 10000) => z.string().trim().min(1).max(max);
export const itemSchema = z.object({
  id: id.optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .max(120),
  title: text(150),
  kind: z.enum(["service", "digital"]),
  category: text(80),
  summary: text(300),
  description: z.string().max(20000),
  image_url: z
    .string()
    .max(2000)
    .refine(
      (v) =>
        !v ||
        (v.startsWith("/") && !v.startsWith("//")) ||
        /^https:\/\//.test(v),
      "Use a local path or HTTPS URL",
    ),
  price_minor: z.number().int().min(100).max(100000000),
  currency: z.enum(["USD", "AED", "EUR", "GBP"]),
  tax_mode: z.enum(["none", "manual", "automatic"]),
  tax_code: z.string().max(100),
  tax_bps: z.number().int().min(0).max(2500),
  delivery_days: z.number().int().min(0).max(365),
  revision_limit: z.number().int().min(0).max(20),
  scope: text(),
  exclusions: text(),
  license_text: z.string().max(20000),
  version: text(50),
  published: z.boolean(),
  checkout_enabled: z.boolean(),
  requires_quote: z.boolean(),
});
export const orderSchema = z.object({
  item_id: id,
  request_key: id,
  client_name: text(150),
  company: z.string().max(200),
  billing_address: text(2000),
  brief: text(10000),
  accept_terms: z.literal(true),
  accept_license: z.boolean(),
});
export function totalFor(price: number, taxBps: number) {
  if (
    !Number.isSafeInteger(price) ||
    price < 100 ||
    !Number.isInteger(taxBps) ||
    taxBps < 0 ||
    taxBps > 2500
  )
    throw new HttpError(400, "Invalid price");
  return price + Math.round((price * taxBps) / 10000);
}
export function assertOwner(
  clientId: string,
  userId: string,
  isAdmin: boolean,
) {
  if (clientId !== userId && !isAdmin)
    throw new HttpError(404, "Order not found");
}
export function assertAdmin(isAdmin: boolean, aal: string) {
  if (!isAdmin || aal !== "aal2")
    throw new HttpError(
      403,
      "Administrator access and two-factor authentication are required",
    );
}
export const sha256 = (value: string | Buffer) =>
  createHash("sha256").update(value).digest("hex");
export function verifyHmac(
  body: Buffer,
  signature: string | undefined,
  secret: string,
) {
  if (!secret || !signature || !/^sha256=[a-f0-9]{64}$/.test(signature))
    return false;
  const expected = createHmac("sha256", secret).update(body).digest();
  const provided = Buffer.from(signature.slice(7), "hex");
  return timingSafeEqual(expected, provided);
}
const extensions = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "txt",
  "csv",
  "zip",
  "step",
  "stp",
  "stl",
  "3mf",
  "dxf",
  "dwg",
  "kicad_pcb",
  "kicad_sch",
  "kicad_pro",
  "gbr",
  "gerber",
  "drl",
  "sch",
  "brd",
]);
export function validateFile(name: string, size: number) {
  if (!Number.isSafeInteger(size) || size <= 0 || size > 25 * 1024 * 1024)
    throw new HttpError(400, "Files must be between 1 byte and 25 MB");
  if (
    !name ||
    name.length > 180 ||
    // Filenames must reject control characters, not only visible path separators.
    // eslint-disable-next-line no-control-regex
    /[\x00-\x1f\x7f/\\]/.test(name) ||
    !extensions.has(name.split(".").pop()?.toLowerCase() || "")
  )
    throw new HttpError(
      400,
      "Use a supported engineering, image, PDF, text or ZIP file",
    );
  return name;
}
export function csvCell(value: unknown) {
  let s = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export function renderTemplate(
  template: string,
  values: Record<string, string>,
) {
  return template.replace(/\{\{([a-z_]+)\}\}/g, (_m, k: string) => {
    if (!(k in values))
      throw new HttpError(409, `Template contains an unknown field: ${k}`);
    return values[k];
  });
}
export function readyForPayment(
  order: { status: string; payment_status: string },
  signed: boolean,
) {
  if (order.payment_status !== "unpaid" && order.payment_status !== "pending")
    throw new HttpError(409, "This order cannot accept another payment");
  if (order.status !== "awaiting_payment" || !signed)
    throw new HttpError(
      409,
      "The scope and required agreements must be final before payment",
    );
}
export const statusTransitions: Record<string, string[]> = {
  received: ["scoping", "awaiting_agreement", "cancelled"],
  scoping: ["awaiting_agreement", "cancelled"],
  awaiting_agreement: ["awaiting_payment", "cancelled"],
  awaiting_payment: ["cancelled"],
  in_progress: ["client_review"],
  client_review: ["in_progress", "completed"],
  completed: [],
  cancelled: [],
};
export function transitionAllowed(from: string, to: string) {
  return statusTransitions[from]?.includes(to) ?? false;
}
