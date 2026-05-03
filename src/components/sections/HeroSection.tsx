import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      // Image fade based on scroll (0 to 1.2 viewport height)
      const fadeStart = 0;
      const fadeEnd = window.innerHeight * 1.2;
      const scrollProgress = Math.min(
        Math.max(window.scrollY - fadeStart, 0) / (fadeEnd - fadeStart),
        1
      );
      setScrollOpacity(1 - scrollProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <section className="relative w-full h-screen overflow-hidden bg-black">
        {/* Background image positioned at top-left, full coverage */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/rendered_v5_draft.webp')",
            backgroundPosition: 'left top',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            opacity: scrollOpacity,
            transform: `translateY(${Math.min(window.scrollY * 0.5, window.innerHeight)}px)`,
          }}
        />

        {/* Premium gradient fade overlay - subtle, tech-focused */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(0, 0, 0, 0.1) 0%,
              rgba(0, 0, 0, 0.15) 50%,
              rgba(0, 0, 0, ${0.3 + (1 - scrollOpacity) * 0.4}) 100%)`,
          }}
        />

        {/* Content - Clean text and arrow at bottom center */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 px-4 z-10">
          {/* Main text block - wide, minimal design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ opacity: scrollOpacity }}
            className="max-w-5xl text-center"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-futura text-white font-bold mb-4 leading-tight drop-shadow-2xl tracking-tight">
              Electrify Your Vision
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-100 font-futura drop-shadow-lg tracking-wide">
              Your Idea, Our Expertise.
            </p>
          </motion.div>

          {/* Clean scroll arrow - minimal design */}
          <motion.div
            className="mt-12 z-20"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ opacity: scrollOpacity }}
          >
            <svg 
              className="w-8 h-8 text-white drop-shadow-lg" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </div>
      </section>
    </>
  );
}
