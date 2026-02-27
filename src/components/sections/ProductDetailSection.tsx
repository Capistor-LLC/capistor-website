import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function ProductDetailSection() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const specs = [
        { label: "Diameter", value: "30-50mm" },
        { label: "Height", value: "10-20mm" },
        { label: "Battery Life", value: "24 hours" },
        { label: "Communication", value: "Wireless long-range" },
    ];

    const features = [
        "Seamless circular LED array with touch pad",
        "PCB-integrated design (complete product)",
        "Rugged construction for restaurant environments",
        "Color-coded light signals for status feedback",
        "Long-range wireless connectivity",
        "24-hour battery life guaranteed",
    ];

    const imageAreas = [
        { title: "Product View", placeholder: "Front view & LED array" },
        { title: "PCB Design", placeholder: "Detailed PCB layout" },
        { title: "Exploded View", placeholder: "Component breakdown" },
    ];

    return (
        <section className="min-h-screen flex items-center bg-kindofwhite py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
                {/* Product Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -30 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-black mb-2">
                        Restaurant Table Pager
                    </h2>
                    <p className="text-sexyblue/50 text-lg sm:text-xl font-futura">
                        Intelligent wireless service coordination
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    {/* LEFT: Images */}
                    <motion.div
                        className="flex flex-col gap-6"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -30 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        {/* Main Image Area */}
                        <div className="rounded-2xl border-2 border-capistor-300/30 bg-kindofwhite/50 shadow-md overflow-hidden min-h-64 sm:min-h-80 md:min-h-96 flex items-center justify-center">
                            <div className="text-center p-8">
                                <p className="text-sexyblue/60 font-fransisco text-base">
                                    {imageAreas[selectedImage].placeholder}
                                </p>
                                <p className="text-sexyblue/40 font-futura text-sm mt-2">
                                    [Placeholder - Add image]
                                </p>
                            </div>
                        </div>

                        {/* Image Selector */}
                        <div className="grid grid-cols-3 gap-3">
                            {imageAreas.map((area, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`p-4 rounded-lg border-2 transition-all ${selectedImage === index
                                        ? "border-sexyblue bg-sexyblue/5"
                                        : "border-capistor-300/30 bg-kindofwhite hover:border-capistor-300/60"
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <p className="text-sexyblue font-futura text-xs sm:text-sm font-semibold text-center">
                                        {area.title}
                                    </p>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* RIGHT: Specs & Features */}
                    <motion.div
                        className="flex flex-col gap-8"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 30 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {/* Key Specs Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {specs.map((spec, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg border border-capistor-300/30 bg-kindofwhite shadow-sm"
                                >
                                    <p className="text-sexyblue/60 font-fransisco text-xs uppercase tracking-wide mb-1">
                                        {spec.label}
                                    </p>
                                    <p className="text-black font-futura font-bold text-lg">
                                        {spec.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Features */}
                        <div className="flex flex-col gap-3">
                            <h3 className="text-black font-futura font-bold text-lg">Key Features</h3>
                            <div className="space-y-2">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        className="p-3 rounded-lg bg-kindofwhite/50 border border-capistor-300/20"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 10 }}
                                        transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                                    >
                                        <p className="text-sexyblue/90 font-fransisco text-sm leading-relaxed">
                                            {feature}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <motion.a
                            href="mailto:shoaib@capistor.com?subject=Restaurant%20Table%20Pager%20Inquiry"
                            className="inline-block px-8 py-4 rounded-lg bg-sexyblue text-kindofwhite font-futura font-bold text-center transition-all hover:shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Request a Quote
                        </motion.a>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
