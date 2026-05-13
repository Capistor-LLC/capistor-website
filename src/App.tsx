import { useRef } from "react";
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
import ProductsPage from "./components/pages/ProductsPage";
import ExperienceSection from "./components/sections/ExperienceSection";
import ProductDetailSection from "./components/sections/ProductDetailSection";
import HeaterControllerSection from "./components/sections/HeaterControllerSection";
import HowItWorksSection from "./components/sections/HowItWorksSection";
import ContactSection from "./components/sections/ContactSection";
import VideoSection from "./components/sections/VideoSection";
import TestimonialsSection from "./components/sections/TestimonialsSection";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminProductsList from "./components/admin/AdminProductsList";
import AdminProductEditor from "./components/admin/AdminProductEditor";
import AdminSubscribers from "./components/admin/AdminSubscribers";
import ProtectedAdmin from "./components/admin/ProtectedAdmin";
import { useProductsFromDb } from "./utils/useProductsFromDb";

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

  const { products, currentProduct, currentImageIndex, setCurrentProduct, setCurrentImageIndex, nextProduct, previousProduct } = useProductsFromDb();

  return (
    <div className="min-h-screen bg-kindofwhite font-domine">
      <MyNavbar sections={sections} />

      <section ref={sections.home}><Home /></section>
      <section ref={sections.services}><Services /></section>
      <section ref={sections.about}><About /></section>

      <section><ExperienceSection /></section>
      <section><HowItWorksSection /></section>
      <section><ProductDetailSection /></section>
      <section><HeaterControllerSection /></section>
      <section><VideoSection /></section>

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

      <section><TestimonialsSection /></section>

      <section ref={sections.blog} id="blog-section"><Blog /></section>
      <section ref={sections.contact}><ContactSection /></section>

      <Footer />
    </div>
  );
}

function PageWithChrome({ children }: { children: React.ReactNode }) {
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
      {children}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cv" element={<PageWithChrome><CVPage /></PageWithChrome>} />
      <Route path="/blog/:slug" element={<PageWithChrome><BlogPostPage /></PageWithChrome>} />
      <Route path="/products" element={<PageWithChrome><ProductsPage /></PageWithChrome>} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedAdmin><AdminDashboard /></ProtectedAdmin>} />
      <Route path="/admin/products" element={<ProtectedAdmin><AdminProductsList /></ProtectedAdmin>} />
      <Route path="/admin/products/new" element={<ProtectedAdmin><AdminProductEditor mode="new" /></ProtectedAdmin>} />
      <Route path="/admin/products/:id/edit" element={<ProtectedAdmin><AdminProductEditor mode="edit" /></ProtectedAdmin>} />
      <Route path="/admin/subscribers" element={<ProtectedAdmin><AdminSubscribers /></ProtectedAdmin>} />
    </Routes>
  );
}

