import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function HeroSection() {
  const [scrollOpacity, setScrollOpacity] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const fadeEnd = window.innerHeight * 1.2;
      const scrollProgress = Math.min(Math.max(y / fadeEnd, 0), 1);
      setScrollOpacity(1 - scrollProgress);
      setScrollY(y);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Respect users who prefer reduced motion — show a still poster instead of the looping video.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Force the muted property and kick off playback on mount. Safari/iOS apply
  // React's `muted` prop inconsistently, so without this the hero can refuse to
  // autoplay and show a play button instead.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
  }, [reducedMotion]);

  return (
    <section className="relative w-full h-[100svh] min-h-[600px] overflow-hidden bg-black">
      {/* Background showcase — looping PCB reveal in the same slot as the former hero image */}
      <div
        className="absolute inset-0"
        style={{
          opacity: scrollOpacity,
          transform: `translateY(${Math.min(scrollY * 0.3, window.innerHeight * 0.5)}px)`,
        }}
      >
        {reducedMotion ? (
          <img
            src="/videos/atmega-hero-poster.webp"
            alt="Capistor custom-designed circular PCB"
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full object-cover object-center"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/videos/atmega-hero-poster.webp"
            aria-hidden="true"
          >
            <source src="/videos/atmega-hero.mp4" type="video/mp4" />
          </video>
        )}
      </div>

      {/* Heavier mobile overlay so text remains readable on busy crops */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom,
            rgba(0, 0, 0, 0.25) 0%,
            rgba(0, 0, 0, 0.30) 40%,
            rgba(0, 0, 0, ${0.55 + (1 - scrollOpacity) * 0.3}) 100%)`,
        }}
      />
      {/* On wider screens fade is lighter to let the render breathe */}
      <div
        className="hidden sm:block absolute inset-0 pointer-events-none bg-black/0 sm:bg-gradient-to-b sm:from-black/10 sm:via-black/15 sm:to-black/30"
        style={{ opacity: 0.5 }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 sm:pb-16 px-5 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ opacity: scrollOpacity }}
          className="max-w-5xl text-center"
        >
          <h1 className="text-[2.75rem] leading-[1.05] sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl sm:leading-tight font-futura text-white font-bold mb-3 sm:mb-4 drop-shadow-2xl tracking-tight">
            Electrify Your Vision
          </h1>
          <p className="text-base sm:text-xl md:text-2xl lg:text-3xl text-gray-100 font-futura drop-shadow-lg tracking-wide">
            Your Idea, Our Expertise.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 sm:mt-12 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: scrollOpacity }}
        >
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-lg"
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
  );
}
