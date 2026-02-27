import { motion } from "framer-motion";
import { useState } from "react";
import { ProductImage as ProductImageType } from "../../utils/productLoader";
import ThoughtBubble from "../ui/ThoughtBubble";

interface ProductImageProps {
  image: ProductImageType | undefined;
  productIndex: number;
  imageIndex: number;
}

export default function ProductImage({
  image,
  productIndex,
  imageIndex,
}: ProductImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!image || !image.url) {
    return (
      <motion.div
        key={`${productIndex}-${imageIndex}`}
        className="w-full max-w-[600px] h-auto max-h-[600px] sm:max-w-[200px] sm:max-h-[200px] md:max-w-[500px] md:max-h-[500px] lg:max-w-[700px] lg:max-h-[700px] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-capistor-100 text-black font-domine relative"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 25px 50px rgba(77, 170, 179, 0.3)",
          transition: { duration: 0.3 },
        }}>
        No Image Available
      </motion.div>
    );
  }

  return (
    <motion.div
      key={`${productIndex}-${imageIndex}`}
      className="w-full max-w-[300px] h-auto max-h-[400px] sm:max-w-[400px] sm:max-h-[500px] md:max-w-[500px] md:max-h-[600px] lg:max-w-[700px] lg:max-h-[700px] rounded-2xl overflow-hidden shadow-2xl relative group"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 25px 50px rgba(77, 170, 179, 0.3)",
        transition: { duration: 0.3 },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}>
      <ThoughtBubble text={image.thought} show={isHovered} />

      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-kindofwhite/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />

      <img
        src={image.url}
        alt={image.alt || `Product ${productIndex + 1} image ${imageIndex + 1}`}
        className="w-full h-full object-cover sm:object-contain md:object-cover transition-transform duration-700"
        style={{
          imageRendering: "crisp-edges",
          position: "relative",
          zIndex: 0,
        }}
        onLoad={() => console.log("Image loaded:", image.url)}
        onError={(e) => console.error("Image failed to load:", image.url, e)}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-kindofwhite/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
    </motion.div>
  );
}