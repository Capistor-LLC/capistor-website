import { motion } from "framer-motion";

const specs = [
  { label: "Power", value: "4.2V @ 10A" },
  { label: "Cell Topology", value: "2× Parallel" },
  { label: "Thermal", value: "Optimized channels" },
  { label: "Sourcing", value: "Multi-vendor" },
];

const gallery = [
  {
    title: "Produced PCB",
    image: "/product_images/Heater_Controller/produced pcb after manufacturing.jpeg",
    alt: "Heater controller — produced PCB after manufacturing",
  },
  {
    title: "PCB Front",
    image: "/product_images/Heater_Controller/HEATER CONTROLLER REV_A_Checked_prototype_v1.0_front.png",
    alt: "Heater controller PCB — front view",
  },
  {
    title: "Back Copper",
    image: "/product_images/Heater_Controller/HEATER CONTROLLER REV_A_Checked_prototype_v1.0_back_copper_plane.png",
    alt: "Heater controller PCB — back copper plane",
  },
  {
    title: "Front Copper",
    image: "/product_images/Heater_Controller/HEATER CONTROLLER REV_A_Checked_prototype_v1.0_front_copper_plane.png",
    alt: "Heater controller PCB — front copper plane",
  },
];

export default function HeaterControllerSection() {
  return (
    <section className="bg-capistor-50 pt-16 lg:pt-24 pb-16 lg:pb-20 overflow-hidden">

      {/* Header — centered */}
      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center mb-10 lg:mb-14"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-sexyblue/35 font-futura text-xs uppercase tracking-[0.25em] mb-4">
          Case Study · 02
        </p>
        <h2 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-futura font-bold text-black leading-[0.95] tracking-tight">
          Heater Controller PCB
        </h2>
      </motion.div>

      {/* Gallery — full bleed: 2 cols on mobile, 4 cols desktop */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-sexyblue/10 mb-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        {gallery.map((item, i) => (
          <motion.div
            key={item.title}
            className="relative h-[40vh] sm:h-[50vh] lg:h-[75vh] group overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse at 50% 45%, #ffffff 0%, #e6e6e6 100%)",
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2 + i * 0.08 }}
          >
            <img
              src={item.image}
              alt={item.alt}
              className="absolute inset-0 w-full h-full object-contain p-5 sm:p-8 lg:p-10 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Image labels under each */}
      <div className="grid grid-cols-2 lg:grid-cols-4 mb-14 lg:mb-20">
        {gallery.map((item) => (
          <div key={item.title} className="text-center py-4 px-2">
            <p className="text-sexyblue/55 font-futura text-xs uppercase tracking-[0.2em]">
              {item.title}
            </p>
          </div>
        ))}
      </div>

      {/* Tagline + specs — contained */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

        <motion.p
          className="text-center text-sexyblue/70 font-fransisco text-base sm:text-lg leading-relaxed mb-10 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Precision thermal management with optimized copper pour, strategic heat dissipation, and
          multi-vendor component sourcing for production resilience.
        </motion.p>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 py-6 border-y border-sexyblue/10 mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {specs.map((spec) => (
            <div key={spec.label} className="text-center">
              <p className="text-sexyblue/35 font-futura text-[10px] uppercase tracking-[0.2em] mb-1.5">
                {spec.label}
              </p>
              <p className="text-black font-futura font-bold text-base sm:text-lg">
                {spec.value}
              </p>
            </div>
          ))}
        </motion.div>

        <p className="text-center text-sexyblue/35 font-fransisco text-xs">
          Portfolio piece — designed for a UAE-based client. Imagery shown for portfolio purposes only.
        </p>
      </div>
    </section>
  );
}
