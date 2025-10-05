import { motion } from "framer-motion";
import SocialCard from "./cards/SocialCard";

export default function About() {
  return (
    <section className="min-h-screen relative top-16">
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="flex flex-col md:flex-row h-full justify-center gap-8 lg:gap-32 relative">
          <div className="w-full md:w-5/12 flex flex-col justify-center text-center">
            <motion.h1
              className="text-2xl sm:text-3xl md:text-4xl font-helvetica font-bold text-sexyblue text-center mb-4 sm:mb-6 md:mb-6 mr-0 sm:mr-4 md:mr-9"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}>
              About the Founder
            </motion.h1>
            <motion.div
              className="bg-kindofwhite p-4 sm:p-6 md:p-6 rounded-2xl border-2 border-capistor-300/20 max-w-xs sm:max-w-md md:max-w-md shadow-lg mr-0 sm:mr-2 md:mr-7 mb-4 sm:mb-6 md:mb-10"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}>
              <motion.p
                className="text-base sm:text-lg md:text-lg text-sexyblue/90 font-fransisco font-normal leading-6 sm:leading-8 md:leading-8 text-justify"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}>
                Shoaib Mustafa is the visionary behind this innovative venture,
                blending technology and design to create impactful solutions.
                With a passion for accessibility and user experience, he leads
                with expertise and creativity.
              </motion.p>
            </motion.div>
          </div>
          <div className="w-full md:w-auto sm:w-auto flex flex-col items-center justify-center border-capistor-300/20 gap-4 sm:gap-6 md:gap-6 lg:gap-8">
            <div className="flex items-center justify-center gap-4 sm:gap-6 sm:mr-4 md:gap-6 lg:gap-8">
              <SocialCard />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
