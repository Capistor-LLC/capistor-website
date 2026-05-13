import { useRef, useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MyNavbar from "./components/Navbar";
import Home from "./components/home";
import About from "./components/pages/About";
import ProductsSection from "./components/sections/ProductsSection";
import Footer from "./components/Footer";
import Services from "./components/pages/Services";
import Blog from "./components/pages/Blog";
import BlogPostPage from "./components/pages/BlogPostPage";
import CVPage from "./components/pages/cv/page";
import ExperienceSection from "./components/sections/ExperienceSection";
import ProductDetailSection from "./components/sections/ProductDetailSection";
import HeaterControllerSection from "./components/sections/HeaterControllerSection";
import HowItWorksSection from "./components/sections/HowItWorksSection";
import ContactSection from "./components/sections/ContactSection";
import VideoSection from "./components/sections/VideoSection";
import TestimonialsSection from "./components/sections/TestimonialsSection";
import { useProductNavigation } from "./utils/useProductNavigation";
import {
  Product,
  loadProducts,
  getFallbackProducts,
} from "./utils/productLoader";

function HomePage() {
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
        const loadedProducts = await loadProducts();
        setProducts(loadedProducts);
      } catch (error) {
        console.warn("Failed to load products, using fallback:", error);
        setProducts(getFallbackProducts());
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

      {/* 1. Hero */}
      <section ref={sections.home}>
        <Home />
      </section>

      {/* 2. Services */}
      <section ref={sections.services}>
        <Services />
      </section>

      {/* 3. About */}
      <section ref={sections.about}>
        <About />
      </section>

      {/* 4. Stats — dark bg */}
      <section>
        <ExperienceSection />
      </section>

      {/* 5. Process */}
      <section>
        <HowItWorksSection />
      </section>

      {/* 6. Case study: Table Pager */}
      <section>
        <ProductDetailSection />
      </section>

      {/* 7. Case study: Heater Controller */}
      <section>
        <HeaterControllerSection />
      </section>

      {/* 8. Video demos — dark bg */}
      <section>
        <VideoSection />
      </section>

      {/* 9. Products gallery */}
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

      {/* 10. Testimonials */}
      <section>
        <TestimonialsSection />
      </section>

      {/* 11. Blog */}
      <section ref={sections.blog} id="blog-section">
        <Blog />
      </section>

      {/* 12. Contact */}
      <section ref={sections.contact}>
        <ContactSection />
      </section>

      {/* Footer (includes newsletter) */}
      <Footer />
    </div>
  );
}

function CVPageWrapper() {
  const sections = {
    home: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    products: useRef<HTMLElement>(null),
    demoproducts: useRef<HTMLElement>(null),
    services: useRef<HTMLElement>(null),
    blog: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };

  return (
    <div className="min-h-screen bg-kindofwhite font-domine">
      <MyNavbar sections={sections} />
      <CVPage />
      <Footer />
    </div>
  );
}

function BlogPostPageWrapper() {
  const sections = {
    home: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    products: useRef<HTMLElement>(null),
    demoproducts: useRef<HTMLElement>(null),
    services: useRef<HTMLElement>(null),
    blog: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };

  return (
    <div className="min-h-screen bg-kindofwhite font-domine">
      <MyNavbar sections={sections} />
      <BlogPostPage />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cv" element={<CVPageWrapper />} />
      <Route path="/blog/:slug" element={<BlogPostPageWrapper />} />
    </Routes>
  );
}
