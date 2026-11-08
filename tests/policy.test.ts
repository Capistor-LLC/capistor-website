import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import {
  assertOwner,
  assertAdmin,
  totalFor,
  readyForPayment,
  verifyHmac,
  validateFile,
  csvCell,
  renderTemplate,
} from "../server/policy.js";
import { checkoutParameters } from "../server/stripe-checkout.js";
import type { Order } from "../src/commerce/types.js";
describe("commercial boundaries", () => {
  it("rejects cross-client access and staff without MFA", () => {
    expect(() => assertOwner("a", "b", false)).toThrow("Order not found");
    expect(() => assertAdmin(true, "aal1")).toThrow();
    expect(() => assertAdmin(false, "aal2")).toThrow();
    expect(() => assertAdmin(true, "aal2")).not.toThrow();
  });
  it("rounds taxes once in integer minor units and rejects invalid values", () => {
    expect(totalFor(9900, 500)).toBe(10395);
    expect(totalFor(101, 500)).toBe(106);
    expect(() => totalFor(-1, 0)).toThrow();
    expect(() => totalFor(1.1, 0)).toThrow();
  });
  it("requires a final payable order and signatures", () => {
    expect(() =>
      readyForPayment(
        { status: "awaiting_agreement", payment_status: "unpaid" },
        true,
      ),
    ).toThrow();
    expect(() =>
      readyForPayment(
        { status: "awaiting_payment", payment_status: "unpaid" },
        false,
      ),
    ).toThrow();
    expect(() =>
      readyForPayment(
        { status: "awaiting_payment", payment_status: "paid" },
        true,
      ),
    ).toThrow();
  });
  it("rejects forged or changed BTCPay payloads", () => {
    const raw = Buffer.from('{"type":"InvoiceSettled"}'),
      secret = "test-secret";
    const sig =
      "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
    expect(verifyHmac(raw, sig, secret)).toBe(true);
    expect(verifyHmac(Buffer.from("{}"), sig, secret)).toBe(false);
    expect(verifyHmac(raw, "sha256=123", secret)).toBe(false);
    expect(verifyHmac(raw, undefined, secret)).toBe(false);
  });
  it("rejects paths, executable files, control chars and oversized uploads", () => {
    for (const name of ["../secret.txt", "bad.exe", "a\n.pdf", "x\\y.zip"])
      expect(() => validateFile(name, 50)).toThrow();
    expect(() => validateFile("board.zip", 26 * 1024 * 1024)).toThrow();
    expect(validateFile("board.kicad_pcb", 300)).toBe("board.kicad_pcb");
  });
  it("neutralizes spreadsheet formulas and escapes CSV fields", () => {
    expect(csvCell(' =HYPERLINK("x")')).toBe('"\' =HYPERLINK(""x"")"');
    expect(csvCell('text,"x"')).toBe('"text,""x"""');
  });
  it("rejects unknown template fields", () => {
    expect(renderTemplate("Hello {{name}}", { name: "Client" })).toBe(
      "Hello Client",
    );
    expect(() => renderTemplate("{{secret}}", {})).toThrow();
  });
});
describe("Stripe Checkout architecture", () => {
  const o = {
    id: "order",
    reference: "CAP-TEST",
    currency: "USD",
    total_minor: 9900,
    item_snapshot: {
      title: "Review",
      price_minor: 9900,
      tax_mode: "none",
      tax_bps: 0,
    },
  } as Order;
  it("uses dynamic wallets, a fixed server total, invoices and order metadata", () => {
    const p = checkoutParameters(o, "test@example.com", "https://capistor.com");
    expect(p).not.toHaveProperty("payment_method_types");
    expect(p.line_items?.[0].price_data?.unit_amount).toBe(9900);
    expect(p.invoice_creation?.enabled).toBe(true);
    expect(p.payment_intent_data?.metadata?.order_id).toBe("order");
    expect(p.adaptive_pricing?.enabled).toBe(false);
  });
  it("keeps the contracted total inclusive for Stripe Tax", () => {
    const p = checkoutParameters(
      {
        ...o,
        item_snapshot: {
          ...o.item_snapshot,
          tax_mode: "automatic",
          tax_code: "txcd_test",
        },
      },
      "test@example.com",
      "https://capistor.com",
    );
    expect(p.automatic_tax?.enabled).toBe(true);
    expect(p.shipping_address_collection?.allowed_countries).toContain("AE");
    expect(p.custom_text?.shipping_address).toHaveProperty("message");
    expect(p.line_items?.[0].price_data?.tax_behavior).toBe("inclusive");
    expect(p.line_items?.[0].price_data?.unit_amount).toBe(9900);
  });
  it("shows a separate configured manual rate without double-taxing", () => {
    const p = checkoutParameters(
      {
        ...o,
        total_minor: 10395,
        item_snapshot: { ...o.item_snapshot, tax_mode: "manual", tax_bps: 500 },
      },
      "test@example.com",
      "https://capistor.com",
      "txr_test",
    );
    expect(p.line_items?.[0].price_data?.unit_amount).toBe(9900);
    expect(p.line_items?.[0].tax_rates).toEqual(["txr_test"]);
  });
});
