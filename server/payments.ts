import type { Context } from "./auth.js";
import type Stripe from "stripe";
import { getOrder, agreementsReady, event } from "./orders.js";
import { check, env, stripe, btcRequest } from "./runtime.js";
import { HttpError, readyForPayment, verifyHmac } from "./policy.js";
import { createCheckout } from "./stripe-checkout.js";
import {
  appOrigin,
  assertPaymentEnvironment,
  paymentMode,
} from "./environment.js";
export async function beginPayment(
  ctx: Context,
  orderId: string,
  provider: string,
): Promise<
  | { url: string }
  | {
      bank: Record<string, string>;
      reference: string;
      total_minor: number;
      currency: string;
    }
> {
  assertPaymentEnvironment(provider);
  const order = await getOrder(ctx, orderId);
  if (ctx.user.id !== order.client_id)
    throw new HttpError(403, "Only the client can start payment");
  readyForPayment(order, await agreementsReady(ctx, orderId));
  const settings = check(
    await ctx.db.from("business_settings").select("*").eq("id", true).single(),
  );
  const enabled: Record<string, boolean> = {
    stripe: settings.stripe_enabled,
    bank: settings.bank_enabled,
    btcpay: settings.btc_enabled,
  };
  if (!enabled[provider])
    throw new HttpError(409, "This payment option is not available");
  if (order.item_snapshot.tax_mode === "automatic" && provider !== "stripe")
    throw new HttpError(
      409,
      "This order uses Stripe Tax. Please pay through Stripe.",
    );
  if (provider === "bank") {
    const bank = JSON.parse(env("BANK_DETAILS_JSON"));
    if (!bank.account_holder || !bank.iban || !bank.bic)
      throw new HttpError(503, "Bank payment instructions are not configured");
    const attempt = check(
      await ctx.db.rpc("reserve_payment", {
        p_order: orderId,
        p_provider: "bank",
      }),
    );
    await event(
      ctx,
      orderId,
      "payment",
      "Bank transfer instructions requested",
      "Use the exact order reference. Uploading a receipt does not confirm payment.",
    );
    return {
      bank,
      reference: order.reference,
      total_minor: attempt.total_minor,
      currency: attempt.currency,
    };
  }
  const attempt = check(
    await ctx.db.rpc("reserve_payment", {
      p_order: orderId,
      p_provider: provider,
    }),
  );
  if (attempt.checkout_url) {
    if (provider === "stripe") {
      const previous = await stripe().checkout.sessions.retrieve(
        attempt.external_id,
      );
      if (previous.status === "expired") {
        check(
          await ctx.db
            .from("payment_attempts")
            .update({ state: "expired" })
            .eq("id", attempt.id)
            .eq("state", "pending"),
        );
        return beginPayment(ctx, orderId, provider);
      }
    }
    return { url: attempt.checkout_url };
  }
  if (
    !attempt.external_id &&
    Date.now() - Date.parse(attempt.created_at) > 23 * 60 * 60 * 1000
  )
    throw new HttpError(
      409,
      "An earlier payment request needs reconciliation before retrying. Contact Capistor.",
    );
  if (
    provider === "btcpay" &&
    Date.now() - Date.parse(attempt.created_at) > 30000
  )
    throw new HttpError(
      409,
      "This Bitcoin invoice requires reconciliation. Please contact Capistor.",
    );
  let externalId: string, url: string;
  if (provider === "stripe") {
    const session = await createCheckout(
      order,
      ctx.user.email!,
      appOrigin(),
      attempt.id,
    );
    if (!session.url) throw new HttpError(502, "Checkout could not be created");
    externalId = session.id;
    url = session.url;
  } else {
    const claim = check(
      await ctx.db
        .from("payment_attempts")
        .update({ state: "creating" })
        .eq("id", attempt.id)
        .eq("state", "created")
        .select("id")
        .maybeSingle(),
    );
    if (!claim)
      throw new HttpError(
        409,
        "The Bitcoin invoice is being created or requires reconciliation.",
      );
    const invoice = await btcRequest(
      `/api/v1/stores/${encodeURIComponent(env("BTCPAY_STORE_ID"))}/invoices`,
      "POST",
      {
        amount: (order.total_minor / 100).toFixed(2),
        currency: order.currency,
        metadata: { orderId: orderId, orderReference: order.reference },
        checkout: {
          redirectURL: `${appOrigin()}/portal/orders/${orderId}`,
          redirectAutomatically: false,
        },
      },
    );
    externalId = invoice.id;
    url = invoice.checkoutLink;
    if (
      typeof externalId !== "string" ||
      typeof url !== "string" ||
      new URL(url).protocol !== "https:"
    )
      throw new HttpError(502, "Invalid invoice response");
  }
  check(
    await ctx.db
      .from("payment_attempts")
      .update({ external_id: externalId, checkout_url: url, state: "pending" })
      .eq("id", attempt.id)
      .in("state", ["created", "creating", "pending"]),
  );
  await event(
    ctx,
    orderId,
    "payment",
    "Payment session created",
    `${provider}. Payment is confirmed only after provider verification.`,
  );
  return { url };
}

async function settleStripeSession(
  db: Context["db"],
  session: Stripe.Checkout.Session,
  eventId: string,
) {
  const attemptId = session.metadata?.attempt_id;
  if (!attemptId || session.payment_status !== "paid") return;
  const orderId = session.metadata?.order_id;
  const identity =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  if (!orderId || session.client_reference_id !== orderId || !identity)
    throw new HttpError(400, "Payment reference mismatch");
  const invoice =
    session.invoice && typeof session.invoice !== "string"
      ? {
          id: session.invoice.id,
          url: session.invoice.hosted_invoice_url,
          pdf: session.invoice.invoice_pdf,
          tax_minor: session.total_details?.amount_tax,
        }
      : null;
  check(
    await db.rpc("settle_order", {
      p_order: orderId,
      p_provider: "stripe",
      p_event: eventId,
      p_identity: identity,
      p_amount: session.amount_total,
      p_currency: session.currency?.toUpperCase(),
      p_attempt: attemptId,
      p_external_id: session.id,
      p_invoice: invoice,
    }),
  );
}

export async function stripeWebhook(
  db: Context["db"],
  raw: Buffer,
  sig: string | undefined,
) {
  if (!sig) throw new HttpError(400, "Missing signature");
  let notification;
  try {
    notification = stripe().webhooks.constructEvent(
      raw,
      sig,
      env("STRIPE_WEBHOOK_SECRET"),
    );
  } catch {
    throw new HttpError(400, "Invalid webhook signature");
  }
  if (notification.livemode !== (paymentMode() === "live"))
    throw new HttpError(400, "Wrong Stripe environment");
  const object = notification.data.object;
  if (
    notification.type === "checkout.session.completed" ||
    notification.type === "checkout.session.async_payment_succeeded"
  ) {
    const incoming = object as { id: string };
    const session = await stripe().checkout.sessions.retrieve(incoming.id, {
      expand: ["invoice"],
    });
    await settleStripeSession(db, session, notification.id);
  }
  if (notification.type === "invoice.paid") {
    const invoice = await stripe().invoices.retrieve(
      (object as { id: string }).id,
    );
    const orderId = invoice.metadata?.order_id;
    if (orderId) {
      const attempts = check(
        await db
          .from("payment_attempts")
          .select("*")
          .eq("order_id", orderId)
          .eq("provider", "stripe"),
      );
      for (const a of attempts) {
        if (!a.external_id) continue;
        const session = await stripe().checkout.sessions.retrieve(
          a.external_id,
          { expand: ["invoice"] },
        );
        if (
          (typeof session.invoice === "string"
            ? session.invoice
            : session.invoice?.id) !== invoice.id
        )
          continue;
        await settleStripeSession(db, session, notification.id);
        break;
      }
    }
  }
  if (
    notification.type === "charge.refunded" ||
    notification.type === "charge.dispute.created"
  ) {
    const isDispute = notification.type === "charge.dispute.created";
    const obj = object as {
      id: string;
      charge?: string;
      payment_intent?: string;
      amount_refunded?: number;
      amount?: number;
    };
    const charge = isDispute
      ? await stripe().charges.retrieve(String(obj.charge))
      : await stripe().charges.retrieve(obj.id);
    if (!charge.payment_intent) return;
    const pi = await stripe().paymentIntents.retrieve(
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent.id,
    );
    const { order_id: orderId, attempt_id: attemptId } = pi.metadata;
    if (!orderId || !attemptId) return;
    const status = isDispute
      ? "disputed"
      : charge.amount_refunded >= charge.amount
        ? "refunded"
        : "partially_refunded";
    check(
      await db.rpc("record_payment_reversal", {
        p_order: orderId,
        p_attempt: attemptId,
        p_identity: pi.id,
        p_event: notification.id,
        p_status: status,
      }),
    );
  }
}
export async function btcWebhook(
  db: Context["db"],
  raw: Buffer,
  sig: string | undefined,
) {
  assertPaymentEnvironment("btcpay");
  if (!verifyHmac(raw, sig, env("BTCPAY_WEBHOOK_SECRET")))
    throw new HttpError(400, "Invalid webhook signature");
  const n = JSON.parse(raw.toString());
  if (n.type !== "InvoiceSettled") return;
  if (
    typeof n.invoiceId !== "string" ||
    typeof n.deliveryId !== "string" ||
    n.storeId !== env("BTCPAY_STORE_ID")
  )
    throw new HttpError(400, "Invalid invoice notification");
  const attempt = check(
    await db
      .from("payment_attempts")
      .select("*")
      .eq("provider", "btcpay")
      .eq("external_id", n.invoiceId)
      .maybeSingle(),
  );
  if (!attempt) throw new HttpError(503, "Invoice not registered yet");
  const invoice = await btcRequest(
    `/api/v1/stores/${encodeURIComponent(env("BTCPAY_STORE_ID"))}/invoices/${encodeURIComponent(n.invoiceId)}`,
  );
  if (
    invoice.status !== "Settled" ||
    (invoice.additionalStatus && invoice.additionalStatus !== "None") ||
    invoice.metadata?.orderId !== attempt.order_id
  )
    throw new HttpError(409, "Invoice requires manual reconciliation");
  const amount = Number(invoice.amount);
  if (!Number.isFinite(amount))
    throw new HttpError(400, "Invalid invoice amount");
  check(
    await db.rpc("settle_order", {
      p_order: attempt.order_id,
      p_provider: "btcpay",
      p_event: n.invoiceId,
      p_identity: n.invoiceId,
      p_amount: Math.round(amount * 100),
      p_currency: invoice.currency,
      p_attempt: attempt.id,
      p_external_id: n.invoiceId,
    }),
  );
}
