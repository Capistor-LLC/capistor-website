import { createClient } from "@supabase/supabase-js";
import { S3Client } from "@aws-sdk/client-s3";
import Stripe from "stripe";
import { HttpError } from "./policy.js";
import { validateStripeKey } from "./environment.js";
import { supabaseFetch } from "../src/lib/supabaseFetch.js";
export function env(name: string) {
  const value = process.env[name];
  if (!value)
    throw new HttpError(
      503,
      "This service is not configured yet. Please contact Capistor.",
    );
  return value;
}
export function database() {
  return createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    global: { fetch: supabaseFetch },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
export function storage() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}
export function stripe() {
  const key = env("STRIPE_SECRET_KEY");
  validateStripeKey(key);
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 });
}
export function btcpayOrigin() {
  const url = new URL(env("BTCPAY_URL"));
  if (url.protocol !== "https:" || url.username || url.password)
    throw new HttpError(503, "Bitcoin payments are not configured");
  return url.origin;
}
export async function btcRequest(path: string, method = "GET", body?: unknown) {
  const res = await fetch(btcpayOrigin() + path, {
    method,
    headers: {
      Authorization: `token ${env("BTCPAY_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
    redirect: "error",
  });
  if (!res.ok)
    throw new HttpError(502, "The Bitcoin payment provider is unavailable");
  return res.json();
}
export function check<T>(result: { data: T; error: unknown }): NonNullable<T> {
  if (result.error) {
    const code = (result.error as { code?: string }).code;
    if (
      (result.error as { message?: string }).message ===
      "A payment is already in progress using another provider"
    )
      throw new HttpError(
        409,
        "This order already has a payment in progress. Continue with that method, or contact Capistor before switching.",
      );
    if (code === "P0001" || code === "23505")
      throw new HttpError(
        409,
        "This record changed or the action is no longer allowed. Refresh the order before retrying.",
      );
    console.error("Database operation failed");
    throw new HttpError(503, "We could not save this request. Please retry.");
  }
  return result.data as NonNullable<T>;
}
