import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function TestimonialsSection() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

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

    return (
        <section className="min-h-screen flex items-center bg-kindofwhite py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl w-full">
                <div className="flex flex-col items-center text-center">
                    {/* Heading */}
                    <motion.div
                        className="mb-16"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -30 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-black">
                            What Customers Say
                        </h2>
                        <p className="text-sexyblue/50 text-lg sm:text-xl font-futura mt-2">
                            Proven across real-world deployments
                        </p>
                    </motion.div>

                    {/* Testimonials Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                        {testimonials.map((testimonial, index) => (
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
                                <div className="flex flex-col flex-grow">
                                    {/* Quote */}
                                    <p className="text-sexyblue/90 font-fransisco text-base leading-relaxed mb-6 italic text-left flex-grow">
                                        "{testimonial.quote}"
                                    </p>

                                    {/* Highlight Badge */}
                                    <div className="mb-4">
                                        <span className="inline-block px-3 py-1 rounded-full border border-capistor-300/40 bg-capistor-200/10 text-sexyblue font-futura text-xs font-semibold">
                                            {testimonial.highlight}
                                        </span>
                                    </div>
                                </div>

                                {/* Author Info */}
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
