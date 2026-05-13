import { useCallback, useEffect, useState } from "react";
import { supabase, ProductWithImages } from "../lib/supabase";
import { Product } from "./productLoader";

/**
 * Loads published products from Supabase and adapts them to the shape
 * expected by the homepage ProductsSection (which uses the legacy Product
 * interface from productLoader.ts).
 */
export function useProductsFromDb() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProductState] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, images:product_images(*)")
        .eq("is_published", true)
        .order("position", { ascending: true });

      if (error) {
        console.warn("Failed to load products from Supabase:", error.message);
        setProducts([]);
        return;
      }

      const mapped: Product[] = (data ?? []).map((p: ProductWithImages) => ({
        id: Number.parseInt(p.id.slice(0, 8), 16) || 0,
        name: p.name,
        tagline: p.tagline,
        images: [...p.images]
          .sort((a, b) => a.position - b.position)
          .map((img) => ({
            url: img.url,
            alt: img.alt,
            thought: img.caption ?? "",
            detail: img.caption ?? p.tagline ?? "",
          })),
        products: undefined,
      }));
      setProducts(mapped);
    })();
  }, []);

  const setCurrentProduct = useCallback((indexOrFn: number | ((prev: number) => number)) => {
    setCurrentProductState((prev) =>
      typeof indexOrFn === "function" ? indexOrFn(prev) : indexOrFn
    );
  }, []);

  const nextProduct = useCallback(() => {
    if (products.length === 0) return;
    setCurrentProductState((prev) => (prev + 1) % products.length);
    setCurrentImageIndex(0);
  }, [products.length]);

  const previousProduct = useCallback(() => {
    if (products.length === 0) return;
    setCurrentProductState((prev) => (prev - 1 + products.length) % products.length);
    setCurrentImageIndex(0);
  }, [products.length]);

  return {
    products,
    currentProduct,
    currentImageIndex,
    setCurrentProduct,
    setCurrentImageIndex,
    nextProduct,
    previousProduct,
  };
}
