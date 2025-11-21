import { useRef, useState, useEffect } from "react";
import MyNavbar from "./components/Navbar";
import Home from "./components/home";
import About from "./components/pages/About";
import ProductsSection from "./components/sections/ProductsSection";

import Services from "./components/pages/Services";
import Blog from "./components/pages/Blog";
import { useProductNavigation } from "./utils/useProductNavigation";
import {
  Product,
  loadProducts,
  getFallbackProducts,
} from "./utils/productLoader";

export default function App() {
  const sections = {
    home: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    products: useRef<HTMLElement>(null),
    demoproducts: useRef<HTMLElement>(null),
    services: useRef<HTMLElement>(null),
    blog: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const initProducts = async () => {
      try {
        const loadedProducts = await loadProducts(); // already returns Product[]
        setProducts(loadedProducts);
      } catch (error) {
        console.warn("Failed to load products, using fallback:", error);
        const fallbackProducts = getFallbackProducts(); // also Product[]

        setProducts(fallbackProducts);
      }
    };
    initProducts();
  }, []);

  const {
    currentProduct,
    currentImageIndex,
    setCurrentProduct,
    setCurrentImageIndex,
    nextProduct,
  } = useProductNavigation(products);

  const previousProduct = () => {
    setCurrentProduct((prev) => (prev - 1 + products.length) % products.length);
    setCurrentImageIndex(0);
  };

  return (
    <div className="min-h-screen bg-kindofwhite font-domine">
      <MyNavbar sections={sections} />
      <section ref={sections.home}>
        <Home />
      </section>
      <section ref={sections.services}>
        <Services />
      </section>
      <section ref={sections.products}>
        <ProductsSection
          products={products}
          currentProduct={currentProduct}
          currentImageIndex={currentImageIndex}
          setCurrentProduct={setCurrentProduct}
          setCurrentImageIndex={setCurrentImageIndex}
          nextProduct={nextProduct}
          previousProduct={previousProduct}
        />
      </section>
      <section ref={sections.blog}>
        <Blog />
      </section>
      <section ref={sections.about}>
        <About />
      </section>
    </div>
  );
}
