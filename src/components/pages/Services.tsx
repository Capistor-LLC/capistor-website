import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Service() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const services = [
    {
      title: "Embedded System Design",
      description:
        "Crafting innovative hardware-software solutions for IoT and automation with precision.",
      image: "/services_images/embedded.jpg",
    },
    {
      title: "PCB Design",
      description:
        "Creating reliable and efficient printed circuit boards tailored to your project needs.",
      image: "/services_images/PCB_Design.jpg",
    },
    {
      title: "Firmware Development",
      description:
        "Developing robust firmware to power embedded devices with optimal performance.",
      image: "/services_images/firmware-development.png",
    },
    {
      title: "CAD Design",
      description:
        "Delivering detailed and accurate 3D models for product prototyping and engineering solutions.",
      image: "/services_images/CAD_Design.jpg",
    },
  ];

  return (
    <section className="min-h-screen flex items-center bg-kindofwhite py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
        <div className="flex flex-col items-center text-center">
          {/* Heading */}
          <motion.div
            className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold mb-10"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -50 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-black">Services We Provide</h1>
            <p className="text-sexyblue/50 text-lg sm:text-xl md:text-2xl font-futura max-w-2xl mx-auto mt-2">
              Innovative Solutions for Your Needs
            </p>
          </motion.div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="flex flex-col justify-between p-4 md:p-5 rounded-2xl border border-capistor-300/30 shadow-md bg-kindofwhite transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{
                  scale: 1.06,
                  borderColor: "rgba(0, 0, 0, 0.25)",
                  boxShadow: "0 15px 25px rgba(0, 0, 0, 0.25)",
                }}
              >
                {/* Title & Description */}
                <div className="flex flex-col flex-grow text-left">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-futura font-bold text-black mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sexyblue/90 text-sm sm:text-base md:text-lg w-full font-fransisco leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Image */}
                <motion.img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-40 sm:h-48 object-cover rounded-xl mt-4"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
