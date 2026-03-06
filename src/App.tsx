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
import TestimonialsSection from "./components/sections/TestimonialsSection";
import ProductDetailSection from "./components/sections/ProductDetailSection";
import HowItWorksSection from "./components/sections/HowItWorksSection";
import ContactSection from "./components/sections/ContactSection";
import VideoSection from "./components/sections/VideoSection";
import NewsletterSection from "./components/sections/NewsletterSection";
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
        const fallbackProducts = getFallbackProducts();
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
      <section>
        <ExperienceSection />
      </section>
      <section>
        <ProductDetailSection />
      </section>
      <section>
        <VideoSection />
      </section>
      <section>
        <HowItWorksSection />
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
      <section>
        <TestimonialsSection />
      </section>
      <section ref={sections.blog} id="blog-section">
        <Blog />
      </section>
      <section ref={sections.about}>
        <About />
      </section>
      <section ref={sections.contact}>
        <ContactSection />
      </section>
      <section>
        <NewsletterSection />
      </section>
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
