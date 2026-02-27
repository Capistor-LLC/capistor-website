import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function About() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="min-h-screen flex items-center bg-kindofwhite py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl w-full">
        <div className="flex flex-col items-center text-center">
          {/* Heading */}
          <motion.div
            className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold mb-10 md:mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -50 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-black">About Capistor</h1>
            <p className="text-sexyblue/50 text-lg sm:text-xl md:text-2xl font-futura max-w-2xl mx-auto mt-2">
              Engineering Innovative Solutions
            </p>
          </motion.div>

          {/* About Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full">
            {/* Company Overview */}
            <motion.div
              className="flex flex-col justify-between p-6 md:p-8 rounded-2xl border border-capistor-300/30 shadow-md bg-kindofwhite transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(0, 0, 0, 0.25)",
                boxShadow: "0 15px 25px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div className="flex flex-col text-left">
                <h3 className="text-xl sm:text-2xl md:text-2xl font-futura font-bold text-black mb-4">
                  Our Company
                </h3>
                <p className="text-sexyblue/90 text-base sm:text-lg font-fransisco leading-relaxed">
                  Capistor is a forward-thinking engineering and technology company specializing in embedded systems, PCB design, and industrial automation solutions. We transform innovative ideas into reliable, scalable products that drive industries forward.
                </p>
              </div>
            </motion.div>

            {/* Mission */}
            <motion.div
              className="flex flex-col justify-between p-6 md:p-8 rounded-2xl border border-capistor-300/30 shadow-md bg-kindofwhite transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(0, 0, 0, 0.25)",
                boxShadow: "0 15px 25px rgba(0, 0, 0, 0.25)",
              }}
            >
              <div className="flex flex-col text-left">
                <h3 className="text-xl sm:text-2xl md:text-2xl font-futura font-bold text-black mb-4">
                  Our Mission
                </h3>
                <p className="text-sexyblue/90 text-base sm:text-lg font-fransisco leading-relaxed">
                  To empower businesses with innovative engineering solutions that combine reliability, performance, and sustainability. We partner with clients to deliver cutting-edge technology that solves real-world challenges.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
