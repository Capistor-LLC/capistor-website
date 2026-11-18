import { createClient } from "@supabase/supabase-js";
import { starterServices } from "../src/commerce/catalog.js";
import {
  CUSTOMER_TERMS,
  PRIVACY_POLICY,
  REFUND_POLICY,
} from "../src/commerce/legalContent.js";
import { CONTRACT_TEMPLATE, NDA_TEMPLATE } from "../server/documents.js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");

const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const fail = (label: string, error: { message: string } | null) => {
  if (error) throw new Error(`${label}: ${error.message}`);
};

const settings = await db
  .from("business_settings")
  .update({
    terms: CUSTOMER_TERMS,
    privacy: PRIVACY_POLICY,
    refund_policy: REFUND_POLICY,
    legal_approved: true,
    updated_at: new Date().toISOString(),
  })
  .eq("id", true);
fail("business policies", settings.error);

const templates = await db.from("legal_templates").upsert([
  {
    id: "nda",
    title: "Mutual non-disclosure agreement",
    body: NDA_TEMPLATE,
    approved: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: "contract",
    title: "Engineering services agreement",
    body: CONTRACT_TEMPLATE,
    approved: true,
    updated_at: new Date().toISOString(),
  },
]);
fail("agreement templates", templates.error);

for (const item of starterServices.filter((i) => i.kind === "service")) {
  const saved = await db
    .from("shop_items")
    .update({
      summary: item.summary,
      description: item.description,
      scope: item.scope,
      exclusions: item.exclusions,
      image_url: item.image_url,
      agreement_required: item.agreement_required,
      booking_required: item.booking_required,
      checkout_enabled: item.checkout_enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", item.slug);
  fail(`service ${item.slug}`, saved.error);
}

const products = starterServices
  .filter((i) => i.kind === "digital")
  .map(({ id, ...item }) => ({ id, ...item, updated_at: new Date().toISOString() }));
const productSave = await db.from("shop_items").upsert(products, { onConflict: "id" });
fail("sample products", productSave.error);

console.log(`Seeded policies, 2 templates and ${products.length} preview products.`);
