import { RefObject, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

interface NavbarProps {
  sections: {
    home: RefObject<HTMLElement>;
    about: RefObject<HTMLElement>;
    products: RefObject<HTMLElement>;
    demoproducts: RefObject<HTMLElement>;
    services: RefObject<HTMLElement>;
    blog: RefObject<HTMLElement>;
    contact: RefObject<HTMLElement>;
  };
}

export default function MyNavbar({ sections }: NavbarProps) {
  const [activeSection, setActiveSection] = useState("home");
  const [navOpacity, setNavOpacity] = useState(0.1);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (section: keyof typeof sections) => {
    // If on home page and section exists, scroll to it
    if (location.pathname === "/" && sections[section].current) {
      sections[section].current.scrollIntoView({ behavior: "smooth" });
      setActiveSection(section);
    } else if (location.pathname !== "/") {
      // If not on home page, navigate to home first, then scroll will happen
      navigate("/");
      // Use setTimeout to allow navigation to complete before scrolling
      setTimeout(() => {
        sections[section].current?.scrollIntoView({ behavior: "smooth" });
        setActiveSection(section);
      }, 100);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Update navbar opacity - starts very transparent at top
      const scrollPosition = window.scrollY;
      const fadeStart = window.innerHeight * 0.2;
      const fadeEnd = window.innerHeight * 1.2;

      if (scrollPosition < fadeStart) {
        setNavOpacity(0.1);
      } else if (scrollPosition < fadeEnd) {
        const fadeProgress = (scrollPosition - fadeStart) / (fadeEnd - fadeStart);
        const opacity = 0.1 + fadeProgress * 0.85;
        setNavOpacity(opacity);
      } else {
        setNavOpacity(0.95);
      }

      // Active section detection
      const scrollWithOffset = window.scrollY + 100;
      const keys = Object.keys(sections) as (keyof typeof sections)[];
      let current = "home";

      for (const key of keys) {
        const section = sections[key].current;
        if (
          section &&
          scrollWithOffset >= section.offsetTop &&
          scrollWithOffset < section.offsetTop + section.offsetHeight
        ) {
          current = key;
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 transition-all duration-200"
      style={{
        backgroundColor: `rgba(0,0,0,${0.65 * navOpacity})`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: `0 8px 32px rgba(0,0,0,${navOpacity * 0.4})`,
        borderBottom: `1px solid rgba(255,255,255,0.06)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center h-16 relative justify-between gap-8">
          <div className="flex items-center">
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.img
                className="max-w-9 max-h-9 md:w-8 md:h-8 sm:h-6 sm:w-6"
                src="/logo_svg1.svg"
                alt="logo"
                whileHover={{ scale: 1.1 }}
                style={{
                  filter: navOpacity < 0.4 ? "drop-shadow(0 0 8px rgba(255,255,255,0.9))" : "none",
                }}
              />
            </motion.div>
          </div>

          <div className="hidden sm:flex items-center space-x-6">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("home");
                }}
                className={`font-futura text-white hover:text-capistor-500 transition-colors duration-200 ${activeSection === "home" ? "font-bold" : ""}`}
              >
                Home
              </a>

              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("services");
                }}
                className={`font-futura text-white hover:text-capistor-500 transition-colors duration-200 ${activeSection === "services" ? "font-bold" : ""}`}
              >
                Services
              </a>

              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("products");
                }}
                className={`font-futura text-white hover:text-capistor-500 transition-colors duration-200 ${activeSection === "products" ? "font-bold" : ""}`}
              >
                Projects
              </a>

              <a
                href="#blog"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("blog");
                }}
                className={`font-futura text-white hover:text-capistor-500 transition-colors duration-200 ${activeSection === "blog" ? "font-bold" : ""}`}
              >
                Blog
              </a>

              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("about");
                }}
                className={`font-futura text-white hover:text-capistor-500 transition-colors duration-200 ${activeSection === "about" ? "font-bold" : ""}`}
              >
                About
              </a>

              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                }}
                className={`font-futura text-white hover:text-capistor-500 transition-colors duration-200 ${activeSection === "contact" ? "font-bold" : ""}`}
              >
                Contact
              </a>
            </div>
          
          <div className="sm:hidden ml-auto">
            <button
              onClick={toggleMenu}
              className="focus:outline-none focus:ring-2 focus:ring-inset focus:ring-capistor-500 p-2 text-white"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>

          {isOpen && (
            <motion.div
              className="sm:hidden absolute left-0 right-0 top-16 shadow-lg rounded-b-2xl p-4 flex flex-col items-stretch space-y-2"
              style={{
                backgroundColor: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderBottom: `1px solid rgba(255,255,255,0.06)`,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mobile Links */}

              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("home");
                }}
                className={`text-white font-futura hover:text-capistor-500 px-4 py-2 ${activeSection === "home" ? "font-bold" : ""}`}
              >
                Home
              </a>

              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("services");
                }}
                className={`text-white font-futura hover:text-capistor-500 px-4 py-2 ${activeSection === "services" ? "font-bold" : ""}`}
              >
                Services
              </a>

              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("products");
                }}
                className={`text-white font-futura hover:text-capistor-500 px-4 py-2 ${activeSection === "products" ? "font-bold" : ""}`}
              >
                Projects
              </a>

              <a
                href="#blog"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("blog");
                }}
                className={`text-white font-futura hover:text-capistor-500 px-4 py-2 ${activeSection === "blog" ? "font-bold" : ""}`}
              >
                Blog
              </a>

              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("about");
                }}
                className={`text-white font-futura hover:text-capistor-500 px-4 py-2 ${activeSection === "about" ? "font-bold" : ""}`}
              >
                About
              </a>

              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                }}
                className={`text-white font-futura hover:text-capistor-500 px-4 py-2 ${activeSection === "contact" ? "font-bold" : ""}`}
              >
                Contact
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}
