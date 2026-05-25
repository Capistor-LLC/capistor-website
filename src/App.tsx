import { lazy, Suspense, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import MyNavbar from "./components/Navbar";
import Home from "./components/home";
import About from "./components/pages/About";
import ProductsSection from "./components/sections/ProductsSection";
import Footer from "./components/Footer";
import Services from "./components/pages/Services";
import Blog from "./components/pages/Blog";
import Capabilities from "./components/pages/Capabilities";
import CVPage from "./components/pages/cv/page";
import ProductsPage from "./components/pages/ProductsPage";
import BlogIndex from "./components/pages/BlogIndex";
import BlogPost from "./components/pages/BlogPost";
import NotFound from "./components/pages/NotFound";
import ExperienceSection from "./components/sections/ExperienceSection";
import ProductDetailSection from "./components/sections/ProductDetailSection";
import HeaterControllerSection from "./components/sections/HeaterControllerSection";
import HowItWorksSection from "./components/sections/HowItWorksSection";
import ContactSection from "./components/sections/ContactSection";
import VideoSection from "./components/sections/VideoSection";
import VideoTestimonialSection from "./components/sections/VideoTestimonialSection";
import TestimonialsSection from "./components/sections/TestimonialsSection";
import Seo from "./components/ui/Seo";
import { useProductsFromDb } from "./utils/useProductsFromDb";

// Lazy-load all admin code so it doesn't ship to public visitors
const AdminLogin = lazy(() => import("./components/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminProductsList = lazy(() => import("./components/admin/AdminProductsList"));
const AdminProductEditor = lazy(() => import("./components/admin/AdminProductEditor"));
const AdminBlogList = lazy(() => import("./components/admin/AdminBlogList"));
const AdminBlogEditor = lazy(() => import("./components/admin/AdminBlogEditor"));
const AdminSeries = lazy(() => import("./components/admin/AdminSeries"));
const AdminSubscribers = lazy(() => import("./components/admin/AdminSubscribers"));
const ProtectedAdmin = lazy(() => import("./components/admin/ProtectedAdmin"));

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

  const {
    products,
    currentProduct,
    currentImageIndex,
    setCurrentProduct,
    setCurrentImageIndex,
    nextProduct,
    previousProduct,
  } = useProductsFromDb();

  return (
    <div className="min-h-screen bg-kindofwhite font-domine">
      <Seo
        title="Capistor Technologies — Custom embedded systems & PCB design"
        description="Custom embedded systems, PCB design, and industrial technology solutions. Engineered for production by Capistor Technologies."
        url="/"
      />
      <MyNavbar sections={sections} />

      <section ref={sections.home}><Home /></section>
      <section><VideoTestimonialSection /></section>
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
      <section ref={sections.contact} id="contact-section"><ContactSection /></section>

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

function AdminFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-kindofwhite">
      <p className="text-sexyblue/40 font-fransisco">Loading…</p>
    </div>
  );
}

function withProtectedAdmin(node: React.ReactNode) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <ProtectedAdmin>{node}</ProtectedAdmin>
    </Suspense>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/capabilities" element={<PageWithChrome><Capabilities /></PageWithChrome>} />
        <Route path="/cv" element={<PageWithChrome><CVPage /></PageWithChrome>} />
        <Route path="/blog" element={<PageWithChrome><BlogIndex /></PageWithChrome>} />
        <Route path="/blog/:slug" element={<PageWithChrome><BlogPost /></PageWithChrome>} />
        <Route path="/products" element={<PageWithChrome><ProductsPage /></PageWithChrome>} />

        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLogin />
            </Suspense>
          }
        />
        <Route path="/admin" element={withProtectedAdmin(<AdminDashboard />)} />
        <Route path="/admin/products" element={withProtectedAdmin(<AdminProductsList />)} />
        <Route path="/admin/products/new" element={withProtectedAdmin(<AdminProductEditor mode="new" />)} />
        <Route path="/admin/products/:id/edit" element={withProtectedAdmin(<AdminProductEditor mode="edit" />)} />
        <Route path="/admin/blog" element={withProtectedAdmin(<AdminBlogList />)} />
        <Route path="/admin/blog/new" element={withProtectedAdmin(<AdminBlogEditor mode="new" />)} />
        <Route path="/admin/blog/:id/edit" element={withProtectedAdmin(<AdminBlogEditor mode="edit" />)} />
        <Route path="/admin/series" element={withProtectedAdmin(<AdminSeries />)} />
        <Route path="/admin/subscribers" element={withProtectedAdmin(<AdminSubscribers />)} />

        <Route path="*" element={<PageWithChrome><NotFound /></PageWithChrome>} />
      </Routes>
    </HelmetProvider>
  );
}
