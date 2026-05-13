import { motion, AnimatePresence } from "framer-motion";
import { Product } from "../../utils/productLoader";
import ProductImage from "../ui/ProductImage";

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
  if (!products || products.length === 0) {
    return (
      <section className="min-h-screen bg-kindofwhite flex items-center justify-center">
        <p className="text-sexyblue font-futura text-xl">Loading products...</p>
      </section>
    );
  }

  const product = products[currentProduct];

  if (!product || !product.images || product.images.length === 0) {
    return (
      <section className="min-h-screen bg-kindofwhite flex items-center justify-center">
        <p className="text-sexyblue font-futura text-xl">No product data available.</p>
      </section>
    );
  }

  const hasMultipleImages = product.images.length > 1;

  const switchProduct = (index: number) => {
    setCurrentProduct(index);
    setCurrentImageIndex(0);
  };

  return (
    <section className="min-h-screen bg-kindofwhite py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full">

        {/* Header row */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-sexyblue/40 font-futura text-xs uppercase tracking-widest mb-1">
              Our Projects
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-black">
              Selected Work
            </h2>
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentProduct}
              className="text-sexyblue/20 font-futura font-bold text-5xl leading-none tabular-nums"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {String(currentProduct + 1).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Product tab bar */}
        <div className="flex gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-px mb-10">
          {products.map((prod, index) => (
            <button
              key={prod.id}
              onClick={() => switchProduct(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-futura text-sm transition-all duration-200 ${
                index === currentProduct
                  ? "bg-sexyblue text-kindofwhite shadow-sm"
                  : "text-sexyblue/40 hover:text-sexyblue hover:bg-sexyblue/5"
              }`}
            >
              {prod.name}
            </button>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center">

          {/* Left: info panel */}
          <div className="lg:col-span-2 flex flex-col justify-center order-2 lg:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`info-${currentProduct}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sexyblue/30 font-futura text-xs uppercase tracking-widest mb-3">
                  {String(currentProduct + 1).padStart(2, "0")} of {String(products.length).padStart(2, "0")}
                </p>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-futura font-bold text-black leading-tight mb-4">
                  {product.name}
                </h3>

                <div className="w-10 h-px bg-sexyblue/25 mb-5" />

                <AnimatePresence mode="wait">
                  <motion.p
                    key={`desc-${currentProduct}-${currentImageIndex}`}
                    className="text-sexyblue/65 font-fransisco text-base leading-relaxed"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {product.images[currentImageIndex]?.detail || "No description available."}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Controls row */}
            <div className="flex items-center gap-3 mt-10">
              <button
                onClick={previousProduct}
                aria-label="Previous product"
                className="w-10 h-10 rounded-full border border-sexyblue/20 flex items-center justify-center text-sexyblue hover:border-sexyblue hover:bg-sexyblue hover:text-kindofwhite transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextProduct}
                aria-label="Next product"
                className="w-10 h-10 rounded-full border border-sexyblue/20 flex items-center justify-center text-sexyblue hover:border-sexyblue hover:bg-sexyblue hover:text-kindofwhite transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {hasMultipleImages && (
                <div className="flex items-center gap-1.5 ml-1">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      aria-label={`Image ${i + 1}`}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentImageIndex
                          ? "w-5 h-1.5 bg-sexyblue"
                          : "w-1.5 h-1.5 bg-sexyblue/25 hover:bg-sexyblue/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: image */}
          <div className="lg:col-span-3 order-1 lg:order-2 relative group flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-wrap-${currentProduct}`}
                className="w-full"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4 }}
              >
                <ProductImage
                  image={product.images[currentImageIndex]}
                  productIndex={currentProduct}
                  imageIndex={currentImageIndex}
                />
              </motion.div>
            </AnimatePresence>

            {hasMultipleImages && (
              <>
                <button
                  onClick={() =>
                    setCurrentImageIndex(
                      (currentImageIndex - 1 + product.images.length) % product.images.length
                    )
                  }
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-sexyblue/70 text-kindofwhite flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm z-20 hover:bg-sexyblue"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex((currentImageIndex + 1) % product.images.length)
                  }
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-sexyblue/70 text-kindofwhite flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 backdrop-blur-sm z-20 hover:bg-sexyblue"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
