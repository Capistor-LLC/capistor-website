import { RefObject, useState, useEffect } from "react";
import { motion } from "framer-motion";

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

  const scrollToSection = (section: keyof typeof sections) => {
    sections[section].current?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(section);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      const keys = Object.keys(sections) as (keyof typeof sections)[];
      let current = "home";

      for (const key of keys) {
        const section = sections[key].current;
        if (
          section &&
          scrollPosition >= section.offsetTop &&
          scrollPosition < section.offsetTop + section.offsetHeight
        ) {
          current = key;
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="fixed top-0 right-0 w-full bg-kindofwhite z-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16 relative">
          <div className="flex items-center space-x-6">
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
              />
            </motion.div>

            <div className="hidden sm:flex space-x-6">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("home");
                }}
                className={`text-black font-futura hover:text-capistor-500 transition-colors duration-200 ${
                  activeSection === "home" ? "font-bold" : ""
                }`}
              >
                Home
              </a>

              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("services");
                }}
                className={`text-black font-futura hover:text-capistor-500 transition-colors duration-200 ${
                  activeSection === "services" ? "font-bold" : ""
                }`}
              >
                Services
              </a>

              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("products");
                }}
                className={`text-black font-futura hover:text-capistor-500 transition-colors duration-200 ${
                  activeSection === "products" ? "font-bold" : ""
                }`}
              >
                Projects
              </a>

              <a
                href="#blog"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("blog");
                }}
                className={`text-black font-futura hover:text-capistor-500 transition-colors duration-200 ${
                  activeSection === "blog" ? "font-bold" : ""
                }`}
              >
                Blog
              </a>

              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("about");
                }}
                className={`text-black font-futura hover:text-capistor-500 transition-colors duration-200 ${
                  activeSection === "about" ? "font-bold" : ""
                }`}
              >
                About
              </a>
            </div>
          </div>

          <div className="sm:hidden ml-4">
            <button
              onClick={toggleMenu}
              className="text-black focus:outline-none focus:ring-2 focus:ring-inset focus:ring-capistor-500 p-2"
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
              className="sm:hidden absolute right-4 top-16 w-48 bg-kindofwhite shadow-lg rounded-lg p-2 flex flex-col items-end space-y-2"
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
                className={`text-black font-futura hover:text-capistor-500 ${
                  activeSection === "home" ? "font-bold" : ""
                }`}
              >
                Home
              </a>

              <a
                href="#services"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("services");
                }}
                className={`text-black font-futura hover:text-capistor-500 ${
                  activeSection === "services" ? "font-bold" : ""
                }`}
              >
                Services
              </a>

              <a
                href="#products"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("products");
                }}
                className={`text-black font-futura hover:text-capistor-500 ${
                  activeSection === "products" ? "font-bold" : ""
                }`}
              >
                Projects
              </a>

              <a
                href="#blog"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("blog");
                }}
                className={`text-black font-futura hover:text-capistor-500 ${
                  activeSection === "blog" ? "font-bold" : ""
                }`}
              >
                Blog
              </a>

              <a
                href="#about"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("about");
                }}
                className={`text-black font-futura hover:text-capistor-500 ${
                  activeSection === "about" ? "font-bold" : ""
                }`}
              >
                About
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}
