import { motion } from "framer-motion";

const stats = [
  {
    number: "1500+",
    label: "Products Designed",
    description: "Custom engineering solutions across industries",
  },
  {
    number: "EU & US",
    label: "Market Presence",
    description: "Products developed for European and American markets",
  },
  {
    number: "IoT · PCB · Firmware",
    label: "Core Expertise",
    description: "Embedded systems to production-ready devices",
  },
];

export default function ExperienceSection() {
  return (
    <section className="min-h-screen flex items-center bg-sexyblue py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
        <div className="flex flex-col items-center text-center">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-kindofwhite">
              Proven Track Record
            </h2>
            <p className="text-kindofwhite/50 text-lg sm:text-xl font-futura mt-2">
              Engineering excellence, delivered at scale
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="flex flex-col justify-between p-6 md:p-8 rounded-2xl border border-kindofwhite/10 bg-kindofwhite/5 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  borderColor: "rgba(238,238,238,0.25)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
              >
                <div>
                  <h3 className="text-3xl sm:text-4xl font-futura font-bold text-kindofwhite mb-2">
                    {stat.number}
                  </h3>
                  <p className="text-lg sm:text-xl font-futura font-semibold text-kindofwhite/80 mb-3">
                    {stat.label}
                  </p>
                  <p className="text-kindofwhite/50 text-sm sm:text-base font-fransisco leading-relaxed">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
