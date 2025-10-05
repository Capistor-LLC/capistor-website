import { motion, AnimatePresence } from "framer-motion";
import { Product } from "../../utils/productLoader";
import ProductImage from "../ui/ProductImage";
import { useState } from "react";

interface ProductsSectionProps {
  products: Product[];
  currentProduct: number;
  currentImageIndex: number;
  setCurrentProduct: (index: number) => void;
  setCurrentImageIndex: (index: number) => void;
  nextProduct: () => void;
  previousProduct: () => void;
}

export default function ProductsSection({
  products,
  currentProduct,
  currentImageIndex,
  setCurrentProduct,
  setCurrentImageIndex,
  nextProduct,
  previousProduct,
}: ProductsSectionProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!products || products.length === 0) {
    return (
      <section className="products-section min-h-screen relative z-10">
        <div className="sticky top-0 h-screen bg-kindofwhite flex items-center justify-center">
          <div className="text-sexyblue font-domine text-xl">
            Loading products...
          </div>
        </div>
      </section>
    );
  }

  const product = products[currentProduct];

  if (!product || !product.images || product.images.length === 0) {
    return (
      <section className="products-section min-h-screen relative z-10">
        <div className="sticky top-0 h-screen bg-kindofwhite flex items-center justify-center">
          <div className="text-sexyblue font-domine text-xl">
            No valid product data available.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="products-section min-h-screen relative z-10">
      <div className="relative top-0 h-screen bg-kindofwhite">
        <div className="flex flex-col md:flex-row h-full justify-center">
          <div className="w-full md:w-5/12 md:mt-24 sm:p-6 md:p-8 lg:p-12 flex flex-col items-center text-center">
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-futura font-bold text-sexyblue mt-6 sm:mt-16 md:mt-20 mb-6 sm:mb-8 md:mb-6"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}>
              {product.name}
            </motion.h2>
            <motion.div
              className="bg-kindofwhite p-4 sm:p-6 md:p-6 rounded-2xl border-2 border-capistor-300/20 max-w-xs sm:max-w-md md:max-w-md shadow-lg mb-4 sm:mb-6 md:mb-8"
              key={`${currentProduct}-info`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}>
              <motion.p
                className="text-base sm:text-lg md:text-lg text-sexyblue/90 font-fransisco font-normal leading-6 sm:leading-8 md:leading-8 text-justify"
                key={`${currentProduct}-${currentImageIndex}-detail`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}>
                {product.images[currentImageIndex]?.detail ||
                  "No description available"}
              </motion.p>
            </motion.div>
          </div>
          <div className="w-full md:w-5/12 relative overflow-visible flex flex-col items-center justify-end">
            <div className="flex flex-col md:flex-row h-full w-full relative md:pt-28">
              <div className="w-full md:w-4/5 flex flex-col items-center relative">
                <motion.div
                  className="w-full max-w-[600px] h-auto max-h-[500px] sm:max-w-[400px] sm:max-h-[400px] md:max-w-[500px] md:max-h-[500px] lg:max-w-[600px] lg:max-h-[600px] flex-1 flex items-center justify-center pt-9 sm:pt-6 md:pt-20 lg:pt-12 relative group"
                  key={`${currentProduct}-image`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}>
                  <ProductImage
                    image={product.images[currentImageIndex]}
                    productIndex={currentProduct}
                    imageIndex={currentImageIndex}
                  />
                  {product.images.length > 1 && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                      <button
                        onClick={() =>
                          setCurrentImageIndex(
                            (currentImageIndex - 1 + product.images.length) %
                              product.images.length
                          )
                        }
                        aria-label="Previous image"
                        className="absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 p-2 sm:p-2 md:p-2 rounded-full bg-sexyblue/75 text-kindofwhite shadow hover:bg-sexyblue transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 sm:w-6 md:w-6 h-5 sm:h-6 md:h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImageIndex(
                            (currentImageIndex + 1) % product.images.length
                          )
                        }
                        aria-label="Next image"
                        className="absolute right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 p-2 sm:p-2 md:p-2 rounded-full bg-sexyblue/75 text-kindofwhite shadow hover:bg-sexyblue transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 sm:w-6 md:w-6 h-5 sm:h-6 md:h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </motion.div>
                <div className="w-full flex justify-center py-3 sm:py-6 md:py-8 gap-2 sm:gap-2 md:gap-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 sm:w-3 md:w-3 h-2 sm:h-3 md:h-3 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? "bg-sexyblue scale-125 shadow-lg shadow-sexyblue/50"
                          : "bg-sexyblue/30 hover:bg-sexyblue/60"
                      }`}
                      aria-label={`Select image ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 sm:gap-4 md:gap-4 md:w-52 mb-4 sm:mb-6 md:mb-8">
                  <button
                    onClick={previousProduct}
                    className="w-32 sm:w-40 md:w-48 py-2 bg-sexyblue text-kindofwhite rounded-lg font-futura text-base sm:text-lg md:text-lg hover:bg-capistor-600 transition-colors duration-200"
                    aria-label="Go to previous product">
                    Previous
                  </button>
                  <button
                    onClick={nextProduct}
                    className="w-32 sm:w-40 md:w-48 py-2 bg-sexyblue text-kindofwhite rounded-lg font-futura text-base sm:text-lg md:text-lg hover:bg-capistor-600 transition-colors duration-200"
                    aria-label="Go to next product">
                    Next
                  </button>
                </div>
                <button
                  className="md:hidden absolute top-12 left-16 w-10 h-10 bg-sexyblue/75 text-kindofwhite rounded-full flex items-center justify-center hover:bg-sexyblue transition-colors duration-200 z-40"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle product menu">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </button>
              </div>
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.nav
                    className="absolute top-3 right-0 w-1/2 h-auto max-h-[calc(100vh-353px)] md:hidden bg-kindofwhite/90 p-4 shadow-lg z-50 mt-6 overflow-y-auto"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}>
                    <button
                      className="w-10 h-10 bg-sexyblue/75 text-kindofwhite rounded-full flex items-center justify-center mb-3 hover:bg-sexyblue transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Close menu">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <motion.ul
                      className="space-y-1 overflow-y-auto max-h-[calc(100vh-100px)]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}>
                      {products.map((prod, index) => (
                        <motion.li
                          key={index}
                          className={`cursor-pointer p-1 rounded-md ${
                            currentProduct === index
                              ? "bg-sexyblue/20"
                              : "hover:bg-sexyblue/10"
                          }`}
                          onClick={() => {
                            setCurrentProduct(index);
                            setIsMenuOpen(false);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}>
                          <span className="text-sexyblue font-helvetica text-xs">
                            {prod.name}{" "}
                            {prod.isNew && (
                              <span className="text-capistor-600 text-xs">
                                (NEW)
                              </span>
                            )}
                          </span>
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.nav>
                )}
              </AnimatePresence>
              <nav className="hidden md:block w-1/2 max-w-1/3 pl-4 md:pt-28 ">
                <motion.ul
                  className="bg-kindofwhite/90 p-4 rounded-lg shadow-lg space-y-2 max-h-[calc(100vh-535px)] overflow-y-auto"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}>
                  {products.map((prod, index) => (
                    <motion.li
                      key={index}
                      className={`cursor-pointer p-2 rounded-md ${
                        currentProduct === index
                          ? "bg-sexyblue/20"
                          : "hover:bg-sexyblue/10"
                      }`}
                      onClick={() => setCurrentProduct(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      <span className="text-sexyblue font-fransisco text-sm">
                        {prod.name}{" "}
                        {prod.isNew && (
                          <span className="text-capistor-600 text-xs">
                            (NEW)
                          </span>
                        )}
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
