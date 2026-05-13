import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "The table pager's wireless range is exceptional. Works reliably across our entire restaurant floor without any dropouts.",
    author: "Marco Rossi",
    role: "Restaurant Manager, Milan",
    highlight: "Reliable Wireless",
  },
  {
    quote:
      "The LED feedback is intuitive—staff immediately understands what each color means. Reduced confusion by 80%.",
    author: "Sarah Chen",
    role: "Operations Lead, Singapore",
    highlight: "User Experience",
  },
  {
    quote:
      "24-hour battery life means no mid-shift charging. The product is built to last. We're rolling out to all our locations.",
    author: "David Thompson",
    role: "Head Chef, London",
    highlight: "Durability",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="min-h-screen flex items-center bg-kindofwhite py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl w-full">
        <div className="flex flex-col items-center text-center">
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-black">
              What Clients Say
            </h2>
            <p className="text-sexyblue/50 text-lg sm:text-xl font-futura mt-2">
              Proven across real-world deployments
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="flex flex-col justify-between p-6 md:p-8 rounded-2xl border border-capistor-300/30 shadow-md bg-kindofwhite transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.03,
                  borderColor: "rgba(52, 58, 64, 0.4)",
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                }}
              >
                <div className="flex flex-col flex-grow">
                  <span className="text-4xl text-sexyblue/20 font-serif leading-none mb-2">"</span>
                  <p className="text-sexyblue/90 font-fransisco text-base leading-relaxed mb-6 text-left flex-grow">
                    {testimonial.quote}
                  </p>
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full border border-capistor-300/40 bg-sexyblue/5 text-sexyblue font-futura text-xs font-semibold">
                      {testimonial.highlight}
                    </span>
                  </div>
                </div>

                <div className="border-t border-capistor-300/20 pt-4">
                  <p className="text-black font-futura font-semibold text-sm">
                    {testimonial.author}
                  </p>
                  <p className="text-sexyblue/60 font-fransisco text-xs">
                    {testimonial.role}
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
