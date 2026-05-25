import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Consult",
    description: "Share your requirements, challenges, and vision for your project.",
  },
  {
    number: "02",
    title: "Design & Prototype",
    description: "We develop schematics, PCB layouts, CAD models, and functional prototypes.",
  },
  {
    number: "03",
    title: "Iterate & Optimize",
    description: "Refine based on testing feedback, optimize for performance and manufacturability.",
  },
  {
    number: "04",
    title: "Deliver & Support",
    description: "Complete documentation, firmware, and ongoing technical support.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="min-h-screen flex items-center bg-capistor-50 py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full">
        <div className="flex flex-col items-center">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-black">
              Our Process
            </h2>
            <p className="text-sexyblue/50 text-lg sm:text-xl font-futura mt-2">
              From concept to deployment
            </p>
          </motion.div>

          <div className="w-full max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-stretch md:justify-between gap-6 md:gap-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col md:flex-1 relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex flex-col p-6 rounded-2xl border border-capistor-300/30 bg-kindofwhite shadow-md h-full min-h-56">
                    <p className="text-5xl font-futura font-bold text-sexyblue/20 mb-4">
                      {step.number}
                    </p>
                    <h3 className="text-xl font-futura font-bold text-black mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sexyblue/80 font-fransisco text-sm leading-relaxed flex-grow">
                      {step.description}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10">
                      <svg
                        className="w-5 h-5 text-capistor-300/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="mt-14 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <button
              onClick={() => {
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-10 py-4 rounded-lg bg-sexyblue text-kindofwhite font-futura font-bold text-center transition-all duration-200 hover:bg-capistor-600 hover:shadow-xl cursor-pointer"
            >
              Get Started
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
