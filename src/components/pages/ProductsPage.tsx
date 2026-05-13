import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase, ProductWithImages } from "../../lib/supabase";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithImages[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, images:product_images(*)")
        .eq("is_published", true)
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
    })();
  }, []);

  const scrollTo = (slug: string) => {
    sectionRefs.current[slug]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-kindofwhite">
      {/* Hero */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sexyblue/35 font-futura text-xs uppercase tracking-[0.25em] mb-4">
            Capistor — Projects
          </p>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-futura font-bold text-black leading-[0.9] tracking-tight mb-6">
            Our Work
          </h1>
          <p className="text-sexyblue/60 font-fransisco text-base sm:text-lg max-w-2xl mx-auto">
            Custom-engineered hardware delivered to clients across Europe, the US, and the Gulf.
          </p>
        </div>
      </section>

      {error && (
        <div className="max-w-3xl mx-auto p-4 mb-8 rounded-lg bg-red-50 border border-red-200 text-red-700 font-fransisco text-sm text-center">
          {error}
        </div>
      )}

      {/* Product index strip */}
      {products && products.length > 0 && (
        <div className="border-y border-sexyblue/10 bg-kindofwhite/80 backdrop-blur-sm sticky top-16 z-30 mb-12">
          <div className="max-w-7xl mx-auto px-6 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-6 py-3">
              {products.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => scrollTo(p.slug)}
                  className="flex-shrink-0 text-left group"
                >
                  <span className="text-sexyblue/30 font-futura text-[10px] tabular-nums mr-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sexyblue/55 group-hover:text-sexyblue font-futura text-sm transition-colors">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product sections */}
      {products === null ? (
        <div className="py-32 text-center text-sexyblue/40 font-fransisco">Loading…</div>
      ) : products.length === 0 ? (
        <div className="py-32 text-center text-sexyblue/40 font-fransisco">
          No products published yet.
        </div>
      ) : (
        products.map((product, idx) => (
          <ProductBlock
            key={product.id}
            product={product}
            index={idx}
            sectionRef={(el) => {
              sectionRefs.current[product.slug] = el;
            }}
          />
        ))
      )}

      {/* Footer spacer */}
      <div className="h-24" />
    </div>
  );
}

function ProductBlock({
  product,
  index,
  sectionRef,
}: {
  product: ProductWithImages;
  index: number;
  sectionRef: (el: HTMLElement | null) => void;
}) {
  const imageCount = product.images.length;
  const gridCols =
    imageCount >= 4
      ? "grid-cols-2 lg:grid-cols-4"
      : imageCount === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : imageCount === 2
          ? "grid-cols-1 sm:grid-cols-2"
          : "grid-cols-1";

  const cellHeight =
    imageCount >= 4
      ? "h-[40vh] sm:h-[50vh] lg:h-[75vh]"
      : imageCount === 1
        ? "h-[55vh] sm:h-[70vh] lg:h-[80vh]"
        : "h-[55vh] sm:h-[65vh] lg:h-[75vh]";

  return (
    <section
      ref={sectionRef}
      className={`py-16 lg:py-24 overflow-hidden ${
        index % 2 === 1 ? "bg-capistor-50/60" : "bg-kindofwhite"
      }`}
    >
      {/* Title */}
      <motion.div
        className="max-w-7xl mx-auto px-6 text-center mb-10 lg:mb-14"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-sexyblue/35 font-futura text-xs uppercase tracking-[0.25em] mb-3">
          Project · {String(index + 1).padStart(2, "0")}
        </p>
        <h2 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-futura font-bold text-black leading-[0.95] tracking-tight">
          {product.name}
        </h2>
      </motion.div>

      {/* Gallery — full bleed */}
      {imageCount === 0 ? (
        <div className="max-w-3xl mx-auto p-12 text-center rounded-2xl border border-dashed border-capistor-300/50 mx-6">
          <p className="text-sexyblue/40 font-fransisco">No images.</p>
        </div>
      ) : (
        <>
          <motion.div
            className={`grid ${gridCols} gap-px bg-sexyblue/10 mb-3`}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {product.images.map((img, i) => (
              <motion.div
                key={img.id}
                className={`relative ${cellHeight} group overflow-hidden`}
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 45%, #f6f6f6 0%, #dedede 100%)",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.15 + i * 0.08 }}
              >
                <img
                  src={img.url}
                  alt={img.alt || product.name}
                  className="absolute inset-0 w-full h-full object-contain p-6 sm:p-10 lg:p-14 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Captions row */}
          <div className={`grid ${gridCols} mb-12 lg:mb-16`}>
            {product.images.map((img) => (
              <div key={img.id} className="text-center py-3 px-3">
                <p className="text-sexyblue/55 font-futura text-xs uppercase tracking-[0.2em]">
                  {img.caption || img.alt || ""}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tagline + optional description */}
      <div className="max-w-3xl mx-auto px-6 text-center">
        {product.tagline && (
          <p className="text-sexyblue/75 font-fransisco text-base sm:text-lg leading-relaxed mb-4">
            {product.tagline}
          </p>
        )}
        {product.description && (
          <p className="text-sexyblue/55 font-fransisco text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        )}
      </div>
    </section>
  );
}
