import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function ProductDetailSection() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const specs = [
        { label: "Dimensions", value: "50x50mm" },
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
        "24-hour battery",
    ];

    const imageAreas = [
        {
            title: "Product View",
            image: "/product_images/pager/exploded_pager.jpeg",
            alt: "Pager Product View"
        },
        {
            title: "PCB Design",
            image: "/product_images/pager/pcb_view_front.jpeg",
            alt: "Pager PCB Front View"
        },
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
                        <motion.div
                            className="rounded-2xl border-2 border-capistor-300/30 bg-kindofwhite/50 shadow-md overflow-hidden aspect-square sm:aspect-auto sm:min-h-80 md:min-h-96 flex items-center justify-center"
                            key={selectedImage}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img
                                src={imageAreas[selectedImage].image}
                                alt={imageAreas[selectedImage].alt}
                                className="w-full h-full object-contain"
                            />
                        </motion.div>

                        {/* Image Selector */}
                        <div className="grid grid-cols-2 gap-3">
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

                        {/* Portfolio Disclaimer */}
                        <motion.div
                            className="p-6 rounded-lg bg-sexyblue/5 border-2 border-sexyblue/20"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <p className="text-sexyblue/90 font-fransisco text-sm leading-relaxed">
                                <span className="font-futura font-bold text-sexyblue">Portfolio Project:</span> This is a product designed for a client. Images and technical details are shared for portfolio purposes only. This product is not for sale—all rights and intellectual property belong to the original client.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
