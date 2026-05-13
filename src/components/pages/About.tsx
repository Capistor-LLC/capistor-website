import { motion } from "framer-motion";

export default function About() {
  return (
    <section className="min-h-screen flex items-center bg-kindofwhite py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl w-full">
        <div className="flex flex-col items-center text-center">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-black">
              About Capistor
            </h2>
            <p className="text-sexyblue/50 text-lg sm:text-xl md:text-2xl font-futura max-w-2xl mx-auto mt-2">
              Engineering Innovative Solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <motion.div
              className="flex flex-col p-6 md:p-8 rounded-2xl border border-capistor-300/30 shadow-md bg-kindofwhite transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(52,58,64,0.25)",
                boxShadow: "0 15px 25px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex flex-col text-left">
                <h3 className="text-xl sm:text-2xl font-futura font-bold text-black mb-4">
                  Our Company
                </h3>
                <p className="text-sexyblue/80 text-base sm:text-lg font-fransisco leading-relaxed">
                  Capistor is a forward-thinking engineering and technology company specializing in
                  embedded systems, PCB design, and industrial automation solutions. We transform
                  innovative ideas into reliable, scalable products that drive industries forward.
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col p-6 md:p-8 rounded-2xl border border-capistor-300/30 shadow-md bg-kindofwhite transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{
                scale: 1.02,
                borderColor: "rgba(52,58,64,0.25)",
                boxShadow: "0 15px 25px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div className="flex flex-col text-left">
                <h3 className="text-xl sm:text-2xl font-futura font-bold text-black mb-4">
                  Our Mission
                </h3>
                <p className="text-sexyblue/80 text-base sm:text-lg font-fransisco leading-relaxed">
                  To empower businesses with innovative engineering solutions that combine
                  reliability, performance, and sustainability. We partner with clients to deliver
                  cutting-edge technology that solves real-world challenges.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
