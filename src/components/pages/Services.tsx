import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Service() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const services = [
    {
      title: "Embedded Systems",
      description:
        "Custom hardware and software solutions for IoT and automation.",
    },
    {
      title: "Laser Projection Engineering",
      description:
        "Innovative laser-based designs for displays and precision applications.",
    },
    {
      title: "Drone Technology Solutions",
      description:
        "Agricultural and industrial drone systems with cutting-edge features.",
    },
    {
      title: "Precision Engineering Services",
      description:
        "PCB design, prototyping, and production-grade hardware solutions.",
    },
  ];

  return (
    <section className="min-h-screen text-sexyblue flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl w-full">
        <div className="relative top-28 md:top-0 h-screen bg-kindofwhite">
          <div className="flex flex-col h-full justify-center">
            <div className="w-full sm:p-6 md:p-8 lg:p-12 flex flex-col items-center text-center">
              <motion.div
                className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold mb-6 sm:mt-4 md:mt-4  sm:mb-8 md:mb-12"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -50 }}
                transition={{ duration: 0.6 }}>
                <h1>Services We Provide</h1>
                <p className="text-sexyblue/40 text-lg sm:text-xl md:text-2xl font-futura max-w-2xl mx-auto ">
                  We Do all the shit.
                </p>
              </motion.div>
              <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6 sm:gap-8 md:gap-10 md:w-full max-w-4xl">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    className="bg-kindofwhite p-4 sm:p-6 md:p-6 sm:w-96 rounded-2xl border-2 border-capistor-300/20 shadow-md"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    whileHover={{ scale: 1.1, borderColor: "" }}>
                    <h3 className="md:text-2xl text-left sm:text-xl font-futura font-bold text-sexyblue mb-2">
                      {service.title}
                    </h3>
                    <p className="text-left md:w-full sm:w-72 sm:text-lg text-sexyblue/90 font-fransisco font-normal leading-6 sm:leading-8">
                      {service.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
