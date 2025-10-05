import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface BlogCardProps {
  title: string;
  text: string;
  imageSrc: string;
  buttonText?: string;
  onClick?: () => void;
}

export default function BlogCard({
  title,
  text,
  imageSrc,
  buttonText = "Read More",
  onClick,
}: BlogCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <motion.div
      className="w-full md:h-full bg-kindofwhite rounded-xl border-2 border-capistor-300/20 shadow-lg overflow-hidden flex md:flex-col h-40 sm:flex-row"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.1, borderColor: "" }}>
      <img
        src={imageSrc}
        alt={title}
        className="md:w-96 md:h-56 w-28 h-40 object-cover"
      />
      <div className="md:p-4 p-3 sm:justify-start justify-between">
        <div>
          <h3 className="md:text-2xl text-left sm:text-xl font-futura font-bold text-sexyblue mb-2">
            {title}
          </h3>
          <p className="text-left md:w-full sm:w-72 sm:text-lg text-sexyblue/90 font-fransisco font-normal leading-6 sm:leading-8">
            {text}
          </p>
        </div>
        <div className="text-left md:text-center mt-3">
          <button
            onClick={onClick}
            className="md:mt-4 sm:mt-4  inline-block py-2 px-6 bg-sexyblue text-kindofwhite rounded-lg font-futura text-base sm:text-lg hover:bg-capistor-600 transition-colors duration-200 md:w-full sm:w-40 text-center">
            {buttonText}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
