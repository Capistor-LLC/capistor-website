import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface UseScrollLogicProps {
  setLogoScale: (scale: number) => void;
  setDisplayText: (text: string) => void;
  setShowBackToTop: (show: boolean) => void;
  setCurrentProduct: (index: number) => void;
}

export const useScrollLogic = ({
  setLogoScale,
  setDisplayText,
  setShowBackToTop,
}: UseScrollLogicProps) => {
  const lenisRef = useRef<Lenis | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const productsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Initialize Lenis with optimized settings for smoother scrolling
    const lenis = new Lenis({
      duration: 1.2, // Slightly increased for smoother feel
      easing: (t) => 1 - Math.pow(1 - t, 5), // Use a more natural easing curve (Quintic Out)
      smoothWheel: true,
      touchMultiplier: 1, // Adjusted for better mobile responsiveness
      infinite: false,
    });
    lenisRef.current = lenis;

    // Sync Lenis with requestAnimationFrame for smoother updates
    function raf(time: number) {
      lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Ensure DOM elements are available before setting up ScrollTrigger
    const checkElements = setInterval(() => {
      productsRef.current = document.querySelector(".products-section") as HTMLElement | null;

      if (heroRef.current && productsRef.current) {
        clearInterval(checkElements);

        // Hero section animation with smoother progress handling
        ScrollTrigger.create({
          trigger: heroRef.current,
          start: "top top",
          end: "+=100%", // Extend end trigger for smoother transition
          scrub: 0.5, // Add scrub for smoother animation tied to scroll
          onUpdate: (self) => {
            const progress = self.progress;
            setLogoScale(1 - progress * 0.3);
            setDisplayText(progress > 0.7 ? "Products" : "We Build Products");
            
          },
        });

        // Products section visibility toggle with smoother thresholds
        ScrollTrigger.create({
          trigger: productsRef.current,
          start: "top 80%", // Trigger earlier for smoother entrance
          end: "bottom 20%",
          onEnter: () => setShowBackToTop(true),
          onLeave: () => setShowBackToTop(false),
          onEnterBack: () => setShowBackToTop(true),
          onLeaveBack: () => setShowBackToTop(false),
        });
      }
    }, 100);

    // Cleanup
    return () => {
      clearInterval(checkElements);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [setLogoScale, setDisplayText, setShowBackToTop]);

  

  const scrollToTop = () => {
    lenisRef.current?.scrollTo(0, {
      duration: 1,
      offset: 0,
      easing: (t) => 1 - Math.pow(1 - t, 5),
    });
  };

  return { scrollToTop };
};