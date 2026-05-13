import { RefObject, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const navLinks: { label: string; section: keyof NavbarProps["sections"] }[] = [
  { label: "Home", section: "home" },
  { label: "Services", section: "services" },
  { label: "Projects", section: "products" },
  { label: "Blog", section: "blog" },
  { label: "About", section: "about" },
  { label: "Contact", section: "contact" },
];

export default function MyNavbar({ sections }: NavbarProps) {
  const [activeSection, setActiveSection] = useState("home");
  const [navOpacity, setNavOpacity] = useState(0.1);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToSection = (section: keyof typeof sections) => {
    if (location.pathname === "/" && sections[section].current) {
      sections[section].current.scrollIntoView({ behavior: "smooth" });
      setActiveSection(section);
    } else if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        sections[section].current?.scrollIntoView({ behavior: "smooth" });
        setActiveSection(section);
      }, 100);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const fadeStart = window.innerHeight * 0.2;
      const fadeEnd = window.innerHeight * 1.2;

      if (scrollPosition < fadeStart) {
        setNavOpacity(0.1);
      } else if (scrollPosition < fadeEnd) {
        const fadeProgress = (scrollPosition - fadeStart) / (fadeEnd - fadeStart);
        setNavOpacity(0.1 + fadeProgress * 0.85);
      } else {
        setNavOpacity(0.95);
      }

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

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 transition-all duration-200"
      style={{
        backgroundColor: `rgba(0,0,0,${0.65 * navOpacity})`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: `0 8px 32px rgba(0,0,0,${navOpacity * 0.4})`,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center h-16 relative justify-between gap-8">
          <motion.img
            className="w-9 h-9 flex-shrink-0"
            src="/logo_svg1.svg"
            alt="Capistor logo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.1 }}
            style={{
              filter: navOpacity < 0.4 ? "drop-shadow(0 0 8px rgba(255,255,255,0.9))" : "none",
            }}
          />

          {/* Desktop links */}
          <div className="hidden sm:flex items-center space-x-6">
            {navLinks.map(({ label, section }) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={(e) => { e.preventDefault(); scrollToSection(section); }}
                className={`font-futura text-white hover:text-capistor-400 transition-colors duration-200 text-sm ${
                  activeSection === section ? "font-bold" : ""
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 text-white focus:outline-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>

          {/* Mobile menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                className="sm:hidden absolute left-0 right-0 top-16 shadow-lg rounded-b-2xl p-4 flex flex-col space-y-1"
                style={{
                  backgroundColor: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {navLinks.map(({ label, section }) => (
                  <a
                    key={section}
                    href={`#${section}`}
                    onClick={(e) => { e.preventDefault(); scrollToSection(section); }}
                    className={`text-white font-futura hover:text-capistor-400 px-4 py-2.5 rounded-lg transition-colors ${
                      activeSection === section ? "font-bold bg-white/5" : ""
                    }`}
                  >
                    {label}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
