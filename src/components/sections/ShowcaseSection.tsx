import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * Full-bleed cinematic showcase band. The macro PCB clip is heavy, so it is
 * lazy-loaded (preload="none") and only plays while it is on screen, keeping it
 * off the initial page load and idle when scrolled past.
 */
export default function ShowcaseSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // ensure the property is set so muted autoplay is allowed

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { threshold: 0.25 }
    );

    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section className="relative w-full bg-black overflow-hidden">
      <div className="relative w-full h-[58vh] min-h-[360px] sm:h-[70vh] lg:h-[82vh]">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted
          playsInline
          preload="none"
          poster="/videos/pcb-macro-poster.webp"
          aria-hidden="true"
        >
          <source src="/videos/pcb-macro-showcase.mp4" type="video/mp4" />
        </video>

        {/* Cinematic gradients for caption legibility */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/10 to-black/35" />
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/65 via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="px-6 sm:px-10 lg:px-16 pb-10 sm:pb-14 lg:pb-20 max-w-3xl"
          >
            <p className="text-capistor-300 font-futura uppercase tracking-[0.25em] text-xs sm:text-sm mb-3">
              Featured build
            </p>
            <h2 className="text-white font-futura font-bold leading-[1.05] text-3xl sm:text-5xl lg:text-6xl">
              Engineered down to the last component
            </h2>
            <p className="mt-4 text-white/70 font-fransisco text-sm sm:text-lg max-w-xl">
              A macro look at a Capistor mixed-signal board — high-density layout,
              clean power delivery, and every footprint placed with intent.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
