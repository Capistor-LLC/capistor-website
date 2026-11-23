import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnv } from "vite";
const env = { ...loadEnv("production", process.cwd(), ""), ...process.env };
const { render } = await import("../.local/ssr/entry-server.js");
const template = readFileSync("dist/index.html", "utf8");
async function published(table) {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(
      `${env.VITE_SUPABASE_URL}/rest/v1/${table}?select=*&${table === "shop_items" ? "published" : "is_published"}=eq.true`,
      {
        headers: {
          apikey: env.VITE_SUPABASE_ANON_KEY,
          ...(!env.VITE_SUPABASE_ANON_KEY.startsWith("sb_")
            ? { Authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}` }
            : {}),
        },
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!res.ok) {
      console.warn(
        `Public ${table} unavailable during prerender (${res.status}).`,
      );
      return [];
    }
    return await res.json();
  } catch {
    console.warn(`Public ${table} unavailable during prerender.`);
    return [];
  }
}
const [items, posts] = await Promise.all([
  published("shop_items"),
  published("blog_posts"),
]);
const validSlug = (s) =>
  typeof s === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s);
const routes = new Set([
  "/",
  "/services",
  "/shop",
  "/work",
  "/about",
  "/journal",
  "/services/hardware-idea-review",
  "/services/pcb-pre-order-review",
  "/services/custom-pcb-design",
  "/journal/better-hardware-project-brief",
  "/journal/pcb-review-before-manufacturing",
  "/journal/buying-digital-engineering-files",
  ...items
    .filter((i) => validSlug(i.slug))
    .map((i) => `/${i.kind === "service" ? "services" : "shop"}/${i.slug}`),
  ...posts.filter((p) => validSlug(p.slug)).map((p) => `/blog/${p.slug}`),
]);
for (const route of routes) {
  const { html, head } = await render(route, { items, posts });
  const dir = resolve("dist", "." + route);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(
    resolve(dir, "index.html"),
    template.replace("<!--app-head-->", head).replace("<!--app-html-->", html),
  );
}
writeFileSync(
  "dist/app.html",
  template.replace("<!--app-head-->", "<title>Capistor Technologies</title>"),
);
writeFileSync(
  "dist/sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...routes]
      .map((r) => `<url><loc>https://capistor.com${r}</loc></url>`)
      .join("\n") +
    "\n</urlset>",
);
console.log(
  `Prerendered ${routes.size} public pages, including ${posts.length} CMS articles and ${items.length} catalogue items.`,
);
