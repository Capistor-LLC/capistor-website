import { HttpError } from "./policy.js";

type Environment = Record<string, string | undefined>;

export function paymentMode(config: Environment = process.env) {
  const mode = config.STRIPE_MODE || "test";
  if (mode !== "test" && mode !== "live")
    throw new HttpError(503, "Payment environment is not configured");
  return mode;
}

export function assertPaymentEnvironment(
  provider: string,
  config: Environment = process.env,
) {
  const mode = paymentMode(config);
  if (config.VERCEL_ENV === "production" && mode !== "live")
    throw new HttpError(503, "Payments are not enabled for this deployment");
  if (
    mode === "live" &&
    config.VERCEL_ENV &&
    config.VERCEL_ENV !== "production"
  )
    throw new HttpError(
      503,
      "Live payments are disabled on preview deployments",
    );
  if (provider !== "stripe" && mode !== "live")
    throw new HttpError(
      409,
      "Bank and Bitcoin payments are disabled in test mode",
    );
}

export function validateStripeKey(
  key: string,
  config: Environment = process.env,
) {
  assertPaymentEnvironment("stripe", config);
  if (!new RegExp(`^(sk|rk)_${paymentMode(config)}_`).test(key))
    throw new HttpError(503, "Stripe key and payment environment do not match");
}

function previewOrigin(host: string | undefined) {
  if (!host || !/^[a-z0-9-]+\.vercel\.app$/i.test(host)) return null;
  return `https://${host}`;
}

export function appOrigin(config: Environment = process.env) {
  const value =
    config.APP_ORIGIN ||
    (config.VERCEL_ENV === "preview"
      ? previewOrigin(config.VERCEL_BRANCH_URL) ||
        previewOrigin(config.VERCEL_URL)
      : null);
  if (!value)
    throw new HttpError(503, "The application origin is not configured");
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      ))
  )
    throw new HttpError(503, "The application origin is not configured");
  return url.origin;
}

export function requestOriginAllowed(
  origin: string | undefined,
  config: Environment = process.env,
) {
  const allowed = [appOrigin(config)];
  if (config.VERCEL_ENV === "preview") {
    for (const host of [config.VERCEL_URL, config.VERCEL_BRANCH_URL]) {
      const value = previewOrigin(host);
      if (value) allowed.push(value);
    }
  }
  return !!origin && allowed.includes(origin);
}
