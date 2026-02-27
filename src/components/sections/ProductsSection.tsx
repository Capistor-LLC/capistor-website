import { motion, AnimatePresence } from "framer-motion";
import { Product } from "../../utils/productLoader";
import ProductImage from "../ui/ProductImage";
import { useState } from "react";
import Box from "@mui/material/Box";

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

  const allProducts = products;

  if (!allProducts || allProducts.length === 0) {
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

  const product = allProducts[currentProduct];

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
      <div className="relative top-32 md:top-0 h-screen bg-kindofwhite">
        <div className="flex flex-col md:flex-row h-full justify-center gap-4 md:gap-0">
          {/* LEFT PANEL */}
          <div className="w-full md:w-1/4 md:mt-24 p-3 sm:p-6 md:p-8 lg:p-12 flex flex-col items-center text-center">
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-futura font-bold text-black mt-6 sm:mt-16 md:mt-16 mb-6 sm:mb-8 md:mb-6"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {product.name}
            </motion.h2>
            <motion.div
              className="bg-kindofwhite p-3 sm:p-4 md:p-5 rounded-2xl border-2 border-capistor-300/20 max-w-xs sm:max-w-sm md:max-w-md shadow-lg mb-3 sm:mb-4 md:mb-6 max-h-80 sm:max-h-96"
              key={`${currentProduct}-info`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <motion.p
                className="text-base sm:text-lg md:text-lg text-sexyblue/90 font-fransisco font-normal leading-6 sm:leading-8 md:leading-8 text-justify"
                key={`${currentProduct}-${currentImageIndex}-detail`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {product.images[currentImageIndex]?.detail ||
                  "No description available"}
              </motion.p>
            </motion.div>
          </div>

          {/* RIGHT SIDE (Image + Nav + Controls) */}
          <div className="w-full md:w-1/2 relative overflow-visible flex flex-col items-center justify-end">
            <div className="flex flex-col md:flex-row h-full w-full relative md:pt-28">
              <div className="w-full md:w-4/5 flex flex-col items-center relative">
                <motion.div
                  className="w-full max-w-[600px] h-auto max-h-[500px] sm:max-w-[400px] sm:max-h-[400px] md:max-w-[500px] md:max-h-[500px] lg:max-w-[600px] lg:max-h-[600px] flex-1 flex items-center justify-center pt-9 sm:pt-6 md:pt-20 lg:pt-12 relative group"
                  key={`${currentProduct}-image`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
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
                        className="absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 p-2 sm:p-2 md:p-2 rounded-full bg-sexyblue/75 text-kindofwhite shadow hover:bg-kindofwhite transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 sm:w-6 md:w-6 h-5 sm:h-6 md:h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
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
                        className="absolute right-4 sm:right-6 md:right-8 top-1/2 -translate-y-1/2 p-2 sm:p-2 md:p-2 rounded-full bg-sexyblue/75 text-kindofwhite shadow hover:bg-sexyblue transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 sm:w-6 md:w-6 h-5 sm:h-6 md:h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
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

                {/* Image indicators */}
                <div className="w-full flex justify-center py-3 sm:py-6 md:py-8 gap-2 sm:gap-2 md:gap-2">
                  {product.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 sm:w-3 md:w-3 h-2 sm:h-3 md:h-3 rounded-full transition-all duration-300 ${index === currentImageIndex
                          ? "bg-sexyblue scale-125 shadow-lg shadow-sexyblue/50"
                          : "bg-sexyblue/30 hover:bg-sexyblue/60"
                        }`}
                      aria-label={`Select image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Prev/Next Buttons */}
                <div className="flex gap-2 sm:gap-4 md:gap-4 md:w-52 mb-4 sm:mb-6 md:mb-8">
                  <button
                    onClick={previousProduct}
                    className="w-32 sm:w-40 md:w-48 py-2 bg-sexyblue text-kindofwhite rounded-lg font-futura text-base sm:text-lg md:text-lg hover:bg-capistor-600 transition-colors duration-200"
                    aria-label="Go to previous product"
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextProduct}
                    className="w-32 sm:w-40 md:w-48 py-2 bg-sexyblue text-kindofwhite rounded-lg font-futura text-base sm:text-lg md:text-lg hover:bg-capistor-600 transition-colors duration-200"
                    aria-label="Go to next product"
                  >
                    Next
                  </button>
                </div>

                {/* Mobile menu toggle */}
                <button
                  className="md:hidden absolute top-12 left-16 w-10 h-10 bg-sexyblue/75 text-kindofwhite rounded-full flex items-center justify-center hover:bg-sexyblue transition-colors duration-200 z-40"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle product menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </button>
              </div>

              {/* MOBILE LIST NAV */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.nav
                    className="absolute top-3 right-0 w-1/2 h-72 max-h-[calc(100vh-300px)] md:hidden bg-kindofwhite/90 p-3 shadow-lg z-50 mt-6 overflow-y-auto"
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <button
                      className="w-10 h-10 bg-sexyblue/75 text-kindofwhite rounded-full flex items-center justify-center mb-3 hover:bg-sexyblue transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Close menu"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    <ul className="space-y-2">
                      {allProducts.map((prod, index) => (
                        <li
                          key={prod.id}
                          onClick={() => {
                            setCurrentProduct(index);
                            setIsMenuOpen(false);
                          }}
                          className={`cursor-pointer px-3 py-2 rounded-md text-sm font-fransisco ${index === currentProduct
                              ? "bg-sexyblue text-kindofwhite"
                              : "text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                          {prod.name}
                        </li>
                      ))}
                    </ul>
                  </motion.nav>
                )}
              </AnimatePresence>

              {/* DESKTOP LIST NAV */}
              <nav className="hidden md:block w-1/6 mr-36 pt-40">
                <Box sx={{ minHeight: 352, minWidth: 250 }}>
                  <ul className="space-y-2">
                    {allProducts.map((prod, index) => (
                      <li
                        key={prod.id}
                        onClick={() => setCurrentProduct(index)}
                        className={`cursor-pointer px-3 py-2 w-40 rounded-md font-fransisco ${index === currentProduct
                            ? "bg-sexyblue text-kindofwhite"
                            : "text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {prod.name}
                      </li>
                    ))}
                  </ul>
                </Box>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
