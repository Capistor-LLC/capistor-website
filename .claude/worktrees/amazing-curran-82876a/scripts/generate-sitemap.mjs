// Build-time sitemap generator. Runs as part of `npm run build`.
//
// Reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from env, queries the
// public REST endpoint for published products + posts, writes
// public/sitemap.xml. RLS guarantees only public rows are visible to anon.

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// In local builds, Vite loads .env.local; Node doesn't. Load it manually if present.
const envPath = join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const SITE_URL = process.env.SITE_URL ?? "https://capistor.com";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const staticRoutes = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/products", changefreq: "weekly", priority: "0.9" },
  { loc: "/blog", changefreq: "daily", priority: "0.9" },
  { loc: "/cv", changefreq: "monthly", priority: "0.5" },
];

async function fetchRows(table, query) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  const url = `${SUPABASE_URL}/rest/v1/${table}?${query}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    console.warn(`[sitemap] failed to fetch ${table}: ${res.status}`);
    return [];
  }
  return res.json();
}

function entry({ loc, lastmod, changefreq = "weekly", priority = "0.7" }) {
  return [
    "  <url>",
    `    <loc>${SITE_URL}${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : "",
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function main() {
  const products = await fetchRows(
    "products",
    "select=slug,updated_at&is_published=eq.true"
  );
  const posts = await fetchRows(
    "blog_posts",
    "select=slug,published_at,updated_at&is_published=eq.true"
  );

  const entries = [
    ...staticRoutes.map(entry),
    ...products.map((p) =>
      entry({
        loc: `/products#${p.slug}`,
        lastmod: p.updated_at?.slice(0, 10),
        changefreq: "monthly",
        priority: "0.8",
      })
    ),
    ...posts.map((p) =>
      entry({
        loc: `/blog/${p.slug}`,
        lastmod: (p.published_at ?? p.updated_at)?.slice(0, 10),
        changefreq: "monthly",
        priority: "0.8",
      })
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

  const out = join(__dirname, "..", "public", "sitemap.xml");
  writeFileSync(out, xml, "utf-8");
  console.log(
    `[sitemap] wrote ${out} — ${staticRoutes.length} static + ${products.length} products + ${posts.length} posts`
  );
}

main().catch((e) => {
  console.error("[sitemap] failed:", e);
  // Don't fail the build over this
});
