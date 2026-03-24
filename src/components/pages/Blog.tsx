import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function BlogSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="min-h-screen bg-kindofwhite py-20 flex items-center justify-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl w-full">
        <div className="flex flex-col items-center">
          {/* Header Section */}
          <motion.div
            className="text-center w-full"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -40 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-futura font-bold text-black mb-6">
              Engineering Stories
            </h1>
            <motion.div
              className="p-12 rounded-2xl bg-sexyblue/5 border-2 border-sexyblue/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-sexyblue text-xl sm:text-2xl font-futura font-bold mb-3">
                🚧 Under Development
              </p>
              <p className="text-sexyblue/80 text-lg sm:text-xl font-fransisco leading-relaxed">
                Our blog section is currently under development. We're working on bringing you insightful engineering stories and project insights. Check back soon!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
