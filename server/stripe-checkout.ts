import type Stripe from "stripe";
import { stripe } from "./runtime.js";
import { HttpError } from "./policy.js";
import { checkoutCountries } from "./stripe-countries.js";
import type { Order } from "../src/commerce/types.js";

export async function taxReadiness() {
  const s = stripe();
  const [settings, registrations, codes] = await Promise.all([
    s.tax.settings.retrieve(),
    s.tax.registrations.list({ status: "active", limit: 100 }),
    s.taxCodes.list({ limit: 100 }),
  ]);
  return {
    active: settings.status === "active" && registrations.data.length > 0,
    settings_status: settings.status,
    registrations: registrations.data.map((r) => ({
      country: r.country,
      status: r.status,
    })),
    codes: codes.data.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
    })),
  };
}
export function checkoutParameters(
  order: Order,
  email: string,
  origin: string,
  rateId?: string,
): Stripe.Checkout.SessionCreateParams {
  const automatic = order.item_snapshot.tax_mode === "automatic",
    manual =
      order.item_snapshot.tax_mode === "manual" &&
      order.item_snapshot.tax_bps > 0;
  if (manual && !rateId) throw new HttpError(409, "Tax rate not configured");
  return {
    mode: "payment",
    client_reference_id: order.id,
    customer_email: email,
    customer_creation: "always",
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    // Fixed contractual currency and total; adaptive conversion is deliberately disabled.
    adaptive_pricing: { enabled: false },
    line_items: [
      {
        price_data: {
          currency: order.currency.toLowerCase(),
          unit_amount: manual
            ? order.item_snapshot.price_minor
            : order.total_minor,
          tax_behavior: automatic ? "inclusive" : "exclusive",
          product_data: {
            name: order.item_snapshot.title,
            description: order.reference,
            ...(automatic ? { tax_code: order.item_snapshot.tax_code } : {}),
          },
        },
        quantity: 1,
        ...(manual ? { tax_rates: [rateId!] } : {}),
      },
    ],
    automatic_tax: { enabled: automatic },
    ...(automatic
      ? {
          shipping_address_collection: { allowed_countries: checkoutCountries },
          custom_text: {
            shipping_address: {
              message:
                "For this digital/service order, enter the address where you will use the deliverable. This address supports tax calculation and wallet eligibility; no physical item will be shipped.",
            },
          },
        }
      : {}),
    invoice_creation: {
      enabled: true,
      invoice_data: {
        description: `Capistor order ${order.reference}`,
        metadata: { order_id: order.id },
        custom_fields: [{ name: "Order reference", value: order.reference }],
      },
    },
    metadata: { order_id: order.id },
    payment_intent_data: { metadata: { order_id: order.id } },
    success_url: `${origin}/portal/orders/${order.id}?payment=processing`,
    cancel_url: `${origin}/portal/orders/${order.id}`,
    // Dynamic payment methods lets Stripe show eligible cards, Apple Pay, Google Pay and Link.
  };
}
export async function createCheckout(
  order: Order,
  email: string,
  origin: string,
  attemptId: string,
) {
  const s = stripe();
  let rateId: string | undefined;
  if (order.item_snapshot.tax_mode === "automatic") {
    if (!order.item_snapshot.tax_code || !(await taxReadiness()).active)
      throw new HttpError(
        409,
        "Stripe Tax requires an active registration and a product tax classification before payment",
      );
  }
  if (
    order.item_snapshot.tax_mode === "manual" &&
    order.item_snapshot.tax_bps
  ) {
    const rate = await s.taxRates.create(
      {
        display_name: "Tax",
        percentage: order.item_snapshot.tax_bps / 100,
        inclusive: false,
      },
      {
        idempotencyKey: `tax-rate:${order.currency}:${order.item_snapshot.tax_bps}`,
      },
    );
    rateId = rate.id;
  }
  const params = checkoutParameters(order, email, origin, rateId);
  // Identifier recommended by the Stripe agent integration guide; retained for API versions supporting it.
  const withIdentifier = {
    ...params,
    metadata: { ...params.metadata, attempt_id: attemptId },
    payment_intent_data: {
      ...params.payment_intent_data,
      metadata: { order_id: order.id, attempt_id: attemptId },
    },
    integration_identifier: "capistor_checkout_hfrqmnvz",
  };
  return s.checkout.sessions.create(withIdentifier, {
    idempotencyKey: `checkout:${attemptId}`,
  });
}
