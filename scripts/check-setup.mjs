// Read-only diagnostics. Never prints credentials, customer records or responses.
import { loadEnv } from "vite";
const config = { ...loadEnv("development", process.cwd(), ""), ...process.env };
let incomplete = false;
const stagingBrowser =
  config.VITE_PAYMENT_MODE === "test" &&
  (config.VITE_STAGING_SUPABASE_URL ||
    config.VITE_STAGING_SUPABASE_ANON_KEY);
const browserUrlKey = stagingBrowser
  ? "VITE_STAGING_SUPABASE_URL"
  : "VITE_SUPABASE_URL";
const browserKeyKey = stagingBrowser
  ? "VITE_STAGING_SUPABASE_ANON_KEY"
  : "VITE_SUPABASE_ANON_KEY";
for (const key of [
  browserUrlKey,
  browserKeyKey,
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "R2_ACCOUNT_ID",
  "R2_BUCKET",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
]) {
  const present =
    !!config[key] &&
    !/REPLACE|PROJECT_REF|SERVER_ONLY|PUBLIC_PUBLISHABLE/.test(config[key]);
  console.log(`${present ? "OK" : "MISSING"} ${key}`);
  if (!present) incomplete = true;
}
if (
  config.SUPABASE_URL &&
  config[browserUrlKey] &&
  config.SUPABASE_URL !== config[browserUrlKey]
) {
  console.log("ERROR Browser and server must use the same Supabase project.");
  incomplete = true;
}
if (
  config.SUPABASE_URL &&
  config.SUPABASE_SERVICE_ROLE_KEY &&
  !/PROJECT_REF/.test(config.SUPABASE_URL)
) {
  try {
    const url = new URL(config.SUPABASE_URL);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co"))
      throw new Error("Invalid project URL");
    for (const table of [
      "staff_members",
      "shop_items",
      "client_orders",
      "blog_posts",
    ]) {
      const response = await fetch(
        `${url.origin}/rest/v1/${table}?select=*&limit=0`,
        {
          headers: {
            apikey: config.SUPABASE_SERVICE_ROLE_KEY,
            ...(!config.SUPABASE_SERVICE_ROLE_KEY.startsWith("sb_")
              ? { Authorization: `Bearer ${config.SUPABASE_SERVICE_ROLE_KEY}` }
              : {}),
          },
          signal: AbortSignal.timeout(10000),
          redirect: "error",
        },
      );
      console.log(
        `${response.ok ? "OK" : "ERROR"} Database table ${table}${response.ok ? "" : ` (HTTP ${response.status})`}`,
      );
      if (!response.ok) incomplete = true;
    }
  } catch {
    console.log("ERROR Could not verify Supabase connectivity.");
    incomplete = true;
  }
}
console.log(
  "These checks do not verify login, R2 uploads, delivered webhooks or live-payment readiness.",
);
process.exitCode = incomplete ? 1 : 0;
