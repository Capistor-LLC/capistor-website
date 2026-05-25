import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase, ProductWithImages } from "../../lib/supabase";
import AdminLayout from "./AdminLayout";

export default function AdminProductsList() {
  const [products, setProducts] = useState<ProductWithImages[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const { data, error } = await supabase
      .from("products")
      .select("*, images:product_images(*)")
      .order("position", { ascending: true });

    if (error) {
      setError(error.message);
      setProducts([]);
      return;
    }
    const sorted = (data ?? []).map((p: ProductWithImages) => ({
      ...p,
      images: [...p.images].sort((a, b) => a.position - b.position),
    }));
    setProducts(sorted);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This also removes its images.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }
    load();
  };

  const onTogglePublish = async (id: string, next: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ is_published: next })
      .eq("id", id);
    if (error) {
      alert("Update failed: " + error.message);
      return;
    }
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-sexyblue/35 font-futura text-xs uppercase tracking-[0.2em] mb-2">
            Catalog
          </p>
          <h1 className="text-3xl font-futura font-bold text-black">Products</h1>
        </div>
        <Link
          to="/admin/products/new"
          className="px-4 py-2 rounded-lg bg-sexyblue text-kindofwhite font-futura text-sm hover:bg-capistor-600 transition-colors"
        >
          + New product
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-fransisco text-sm">
          {error}
        </div>
      )}

      {products === null ? (
        <p className="text-sexyblue/50 font-fransisco">Loading…</p>
      ) : products.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-dashed border-capistor-300/50 bg-white">
          <p className="text-sexyblue/55 font-fransisco mb-4">No products yet.</p>
          <Link
            to="/admin/products/new"
            className="inline-block px-4 py-2 rounded-lg bg-sexyblue text-kindofwhite font-futura text-sm"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="flex items-center gap-5 p-4 rounded-2xl border border-capistor-200/70 bg-white hover:border-sexyblue/30 transition-colors"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-capistor-50 flex-shrink-0 flex items-center justify-center">
                {p.images[0]?.url ? (
                  <img
                    src={p.images[0].url}
                    alt={p.images[0].alt || p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sexyblue/30 font-futura text-xs">No image</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-futura font-bold text-black truncate">{p.name}</h3>
                  {!p.is_published && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-futura uppercase tracking-wide">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-sexyblue/60 font-fransisco text-sm truncate">
                  {p.tagline || <em className="text-sexyblue/30">No tagline</em>}
                </p>
                <p className="text-sexyblue/35 font-futura text-xs mt-1">
                  {p.images.length} image{p.images.length === 1 ? "" : "s"} · /{p.slug}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onTogglePublish(p.id, !p.is_published)}
                  className="px-3 py-1.5 rounded-md border border-capistor-300/40 text-sexyblue/70 hover:text-sexyblue hover:border-sexyblue/40 font-futura text-xs transition-colors"
                >
                  {p.is_published ? "Unpublish" : "Publish"}
                </button>
                <Link
                  to={`/admin/products/${p.id}/edit`}
                  className="px-3 py-1.5 rounded-md bg-sexyblue text-kindofwhite font-futura text-xs hover:bg-capistor-600 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(p.id, p.name)}
                  className="px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 font-futura text-xs transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
