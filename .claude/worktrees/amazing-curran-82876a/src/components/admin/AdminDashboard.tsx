import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import AdminLayout from "./AdminLayout";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    products: number;
    posts: number;
    subscribers: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase.from("subscribers").select("id", { count: "exact", head: true }),
    ]).then(([p, b, s]) => {
      setStats({
        products: p.count ?? 0,
        posts: b.count ?? 0,
        subscribers: s.count ?? 0,
      });
    });
  }, []);

  const tiles = [
    {
      label: "Products",
      value: stats?.products ?? "—",
      to: "/admin/products",
      cta: "Manage products",
    },
    {
      label: "Blog posts",
      value: stats?.posts ?? "—",
      to: "/admin/blog",
      cta: "Write & edit posts",
    },
    {
      label: "Mailing list",
      value: stats?.subscribers ?? "—",
      to: "/admin/subscribers",
      cta: "View subscribers",
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-10">
        <p className="text-sexyblue/35 font-futura text-xs uppercase tracking-[0.2em] mb-2">
          Overview
        </p>
        <h1 className="text-3xl font-futura font-bold text-black">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {tiles.map((t) => (
          <Link
            key={t.label}
            to={t.to}
            className="group block p-7 rounded-2xl border border-capistor-200/70 bg-white hover:border-sexyblue/30 hover:shadow-md transition-all"
          >
            <p className="text-sexyblue/40 font-futura text-xs uppercase tracking-widest mb-3">
              {t.label}
            </p>
            <p className="text-5xl font-futura font-bold text-black tabular-nums leading-none mb-5">
              {t.value}
            </p>
            <p className="text-sexyblue/60 font-futura text-sm group-hover:text-sexyblue transition-colors">
              {t.cta} →
            </p>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-capistor-200/70 bg-white p-7">
        <h2 className="font-futura font-bold text-black mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/products/new"
            className="px-4 py-2 rounded-lg bg-sexyblue text-kindofwhite font-futura text-sm hover:bg-capistor-600 transition-colors"
          >
            + New product
          </Link>
          <Link
            to="/admin/blog/new"
            className="px-4 py-2 rounded-lg bg-sexyblue text-kindofwhite font-futura text-sm hover:bg-capistor-600 transition-colors"
          >
            + New blog post
          </Link>
          <Link
            to="/products"
            className="px-4 py-2 rounded-lg border border-capistor-300/40 text-sexyblue font-futura text-sm hover:border-sexyblue/40 transition-colors"
          >
            View /products
          </Link>
          <Link
            to="/blog"
            className="px-4 py-2 rounded-lg border border-capistor-300/40 text-sexyblue font-futura text-sm hover:border-sexyblue/40 transition-colors"
          >
            View /blog
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
