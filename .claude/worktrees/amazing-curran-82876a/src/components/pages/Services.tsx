import { motion } from "framer-motion";

const services = [
  {
    number: "01",
    title: "Embedded System Design",
    description:
      "Hardware-software solutions for IoT and automation — from concept to production-ready device.",
    image: "/services_images/embedded.jpg",
  },
  {
    number: "02",
    title: "PCB Design",
    description:
      "Multi-layer boards engineered for signal integrity, thermal performance, and manufacturability.",
    image: "/services_images/PCB_Design.jpg",
  },
  {
    number: "03",
    title: "Firmware Development",
    description:
      "Robust, performant firmware for microcontrollers and embedded Linux targets.",
    image: "/services_images/firmware-development.png",
  },
  {
    number: "04",
    title: "CAD Design",
    description:
      "Precise 3D models and enclosure design built for rapid prototyping and mass production.",
    image: "/services_images/CAD_Design.jpg",
  },
];

export default function Service() {
  return (
    <section className="min-h-screen flex items-center bg-kindofwhite py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full">

        {/* Heading */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-black">
            Services We Provide
          </h2>
          <p className="text-sexyblue/40 text-lg sm:text-xl font-futura mt-2">
            Innovative solutions for your needs
          </p>
        </motion.div>

        {/* 2×2 card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="group relative overflow-hidden rounded-2xl aspect-[16/10] cursor-default"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: index * 0.08 }}
            >
              {/* Full-bleed background image */}
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Gradient overlay — always on, deepens on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 transition-opacity duration-400 group-hover:from-black/90" />

              {/* Large background number — decorative */}
              <span className="absolute top-4 right-5 font-futura font-bold text-7xl leading-none text-white/10 select-none transition-all duration-500 group-hover:text-white/15 group-hover:scale-110 origin-top-right">
                {service.number}
              </span>

              {/* Content pinned to bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                {/* Thin accent line that slides in on hover */}
                <div className="w-8 h-0.5 bg-white/50 mb-3 transition-all duration-300 group-hover:w-14 group-hover:bg-white" />

                <h3 className="text-xl sm:text-2xl font-futura font-bold text-white mb-2 leading-tight">
                  {service.title}
                </h3>
                <p className="text-white/65 font-fransisco text-sm leading-relaxed transition-all duration-300 group-hover:text-white/85">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
