import { useRef } from "react";
import HeroSection from "./sections/HeroSection";

export default function Home() {
  const containerRef = useRef(null);

  return (
    <div ref={containerRef} className="relative pt-16">
      <HeroSection />
    </div>
  );
}
