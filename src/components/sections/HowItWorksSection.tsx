import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function HowItWorksSection() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

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

    return (
        <section className="min-h-screen flex items-center bg-kindofwhite py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full">
                <div className="flex flex-col items-center">
                    {/* Heading */}
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -30 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-black">
                            Our Process
                        </h2>
                        <p className="text-sexyblue/50 text-lg sm:text-xl font-futura mt-2">
                            From concept to deployment
                        </p>
                    </motion.div>

                    {/* Steps Timeline */}
                    <div className="w-full max-w-5xl">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    className="flex flex-col md:flex-1 relative"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    {/* Step Card */}
                                    <div className="flex flex-col p-4 sm:p-6 rounded-2xl border border-capistor-300/30 bg-kindofwhite shadow-md min-h-60 sm:min-h-72">
                                        {/* Number */}
                                        <p className="text-5xl font-futura font-bold text-sexyblue/30 mb-4">
                                            {step.number}
                                        </p>

                                        {/* Title */}
                                        <h3 className="text-xl font-futura font-bold text-black mb-3">
                                            {step.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sexyblue/80 font-fransisco text-sm leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Horizontal Arrow (hidden on last item, desktop only) */}
                                    {index < steps.length - 1 && (
                                        <div className="hidden md:flex absolute -right-8 top-1/3 transform -translate-x-1/2">
                                            <svg
                                                className="w-6 h-4 text-capistor-300/40"
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

                    {/* CTA */}
                    <motion.div
                        className="mt-12 flex justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <button
                            onClick={() => {
                                const contactSection = document.getElementById("contact");
                                contactSection?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="px-8 py-4 rounded-lg bg-sexyblue text-kindofwhite font-futura font-bold text-center transition-all hover:shadow-lg cursor-pointer"
                        >
                            Get Started
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
