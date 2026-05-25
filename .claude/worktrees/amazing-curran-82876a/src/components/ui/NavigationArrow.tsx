import { motion } from "framer-motion";

interface NavigationArrowProps {
  show: boolean;
  onClick: () => void;
  className?: string;
}

export default function NavigationArrow({ show, onClick, className = "" }: NavigationArrowProps) {
  if (!show) return null;

  return (
    <motion.button
      onClick={onClick}
      className={`z-10 fixed bottom-8 left-1/2 -translate-x-1/2 ${className} md:bottom-12`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: 0, duration: 0.8 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Scroll to top"
    >
      <div className="backdrop-blur-sm rounded-full p-3 border bg-sexyblue border-sexyblue/30 shadow-lg">
        <svg
          className="w-6 h-6 text-kindofwhite animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: "rotate(180deg)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </div>
    </motion.button>
  );
}