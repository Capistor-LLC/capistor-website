import { motion } from "framer-motion";

const specs = [
  { label: "Form Factor", value: "50 × 50 mm" },
  { label: "Battery", value: "24 hours" },
  { label: "Range", value: "Long-range wireless" },
  { label: "Build", value: "Restaurant-grade" },
];

const gallery = [
  {
    title: "Product View",
    image: "/product_images/pager/exploded_pager.jpeg",
    alt: "Restaurant table pager — exploded product view",
  },
  {
    title: "PCB Design",
    image: "/product_images/pager/pcb_view_front.jpeg",
    alt: "Restaurant table pager — PCB front view",
  },
];

export default function ProductDetailSection() {
  return (
    <section className="bg-kindofwhite pt-12 sm:pt-16 lg:pt-24 pb-14 sm:pb-16 lg:pb-20 overflow-hidden">

      {/* Header — centered */}
      <motion.div
        className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center mb-10 lg:mb-14"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-sexyblue/35 font-futura text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.25em] mb-3 sm:mb-4">
          Case Study · 01
        </p>
        <h2 className="text-[2rem] sm:text-6xl lg:text-7xl xl:text-8xl font-futura font-bold text-black leading-[1] sm:leading-[0.95] tracking-tight">
          Restaurant Table Pager
        </h2>
      </motion.div>

      {/* Gallery — full bleed, edge to edge, 2 cols */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-sexyblue/10 mb-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        {gallery.map((item, i) => (
          <motion.div
            key={item.title}
            className="relative h-[45vh] min-h-[280px] sm:h-[65vh] lg:h-[75vh] group overflow-hidden"
            style={{
              background:
                "radial-gradient(ellipse at 50% 45%, #f6f6f6 0%, #dedede 100%)",
            }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
          >
            <img
              src={item.image}
              alt={item.alt}
              className="absolute inset-0 w-full h-full object-contain p-5 sm:p-12 lg:p-16 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Image labels under each */}
      <div className="grid grid-cols-1 sm:grid-cols-2 mb-14 lg:mb-20">
        {gallery.map((item) => (
          <div key={item.title} className="text-center py-4 px-4">
            <p className="text-sexyblue/55 font-futura text-xs uppercase tracking-[0.25em]">
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
          Wireless service coordination with color-coded LED feedback and 24-hour battery —
          built ruggedly for high-traffic restaurant environments.
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
          Portfolio piece — designed for a client. Imagery shown for portfolio purposes only.
        </p>
      </div>
    </section>
  );
}
