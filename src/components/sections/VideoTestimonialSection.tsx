import { motion } from "framer-motion";
import { useRef, useState } from "react";

export default function VideoTestimonialSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    if (!next) v.play().catch(() => {});
    setMuted(next);
  };

  const scrollToContact = () => {
    document
      .getElementById("contact-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-sexyblue py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 md:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto w-full max-w-[360px] md:w-[400px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black"
          >
            <video
              ref={videoRef}
              src="/videos/capistor-ugc-720.mp4"
              poster="/videos/capistor-ugc-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onClick={toggleMute}
              className="w-full h-full object-cover cursor-pointer"
            />

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute video" : "Mute video"}
              className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-sm flex items-center justify-center text-white transition"
            >
              {muted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="22" y1="9" x2="16" y2="15" />
                  <line x1="16" y1="9" x2="22" y2="15" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>

            {muted && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-sm text-white/90 text-[11px] font-futura tracking-wide pointer-events-none"
              >
                Tap for sound
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-center md:text-left"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-white leading-tight">
              Why Teams Choose Capistor
            </h2>
            <p className="text-white/60 font-fransisco text-base sm:text-lg mt-4 max-w-md mx-auto md:mx-0">
              Engineered for production. Delivered with the discipline of a
              partner who treats your roadmap like our own.
            </p>

            <ul className="mt-6 space-y-3 text-white/85 font-fransisco text-base max-w-md mx-auto md:mx-0">
              <li className="flex gap-3">
                <span className="text-capistor-300">→</span>
                <span>Production-grade embedded & PCB design</span>
              </li>
              <li className="flex gap-3">
                <span className="text-capistor-300">→</span>
                <span>Transparent process, weekly demos</span>
              </li>
              <li className="flex gap-3">
                <span className="text-capistor-300">→</span>
                <span>Shipped across food-service, IoT, industrial</span>
              </li>
            </ul>

            <button
              type="button"
              onClick={scrollToContact}
              className="mt-8 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-sexyblue font-futura font-semibold hover:bg-capistor-300 hover:text-white transition"
            >
              Start your project →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
