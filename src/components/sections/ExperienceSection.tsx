import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function ExperienceSection() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

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
            number: "IoT • PCB • Firmware",
            label: "Core Expertise",
            description: "Embedded systems to production-ready devices",
        },
    ];

    return (
        <section className="min-h-screen flex items-center bg-kindofwhite py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
                <div className="flex flex-col items-center text-center">
                    {/* Heading */}
                    <motion.div
                        className="mb-16"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -30 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-black">
                            Proven Track Record
                        </h2>
                        <p className="text-sexyblue/50 text-lg sm:text-xl font-futura mt-2">
                            Engineering excellence, delivered at scale
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                className="flex flex-col justify-between p-6 md:p-8 rounded-2xl border border-capistor-300/30 shadow-md bg-kindofwhite transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                whileHover={{
                                    scale: 1.05,
                                    borderColor: "rgba(52, 58, 64, 0.4)",
                                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                                }}
                            >
                                <div>
                                    <h3 className="text-3xl sm:text-4xl font-futura font-bold text-sexyblue mb-2">
                                        {stat.number}
                                    </h3>
                                    <p className="text-lg sm:text-xl font-futura font-semibold text-black mb-3">
                                        {stat.label}
                                    </p>
                                    <p className="text-sexyblue/80 text-sm sm:text-base font-fransisco leading-relaxed">
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
