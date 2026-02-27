import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer className="bg-sexyblue text-kindofwhite py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center md:text-left"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                >
                    {/* Company Info */}
                    <div>
                        <h3 className="text-xl font-futura font-bold text-kindofwhite mb-4">
                            Capistor
                        </h3>
                        <p className="text-kindofwhite/80 font-fransisco text-sm leading-relaxed">
                            Engineering innovative embedded systems and industrial technology solutions.
                        </p>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-futura font-bold text-kindofwhite mb-4">
                            Contact
                        </h3>
                        <p className="text-kindofwhite/80 font-fransisco text-sm mb-2">
                            Email:{" "}
                            <a
                                href="mailto:shoaib@capistor.com"
                                className="text-kindofwhite hover:text-capistor-100 transition-colors"
                            >
                                shoaib@capistor.com
                            </a>
                        </p>
                        <p className="text-kindofwhite/80 font-fransisco text-sm">
                            Phone:{" "}
                            <a
                                href="tel:+971508726178"
                                className="text-kindofwhite hover:text-capistor-100 transition-colors"
                            >
                                +971 508 726 178
                            </a>
                        </p>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="text-lg font-futura font-bold text-kindofwhite mb-4">
                            Address
                        </h3>
                        <p className="text-kindofwhite/80 font-fransisco text-sm">
                            Silicon Oasis, IFZA Business Park
                            <br />
                            Dubai, UAE
                        </p>
                    </div>
                </motion.div>

                {/* Divider */}
                <div className="my-8 border-t border-kindofwhite/20"></div>

                {/* Copyright */}
                <motion.div
                    className="text-center pt-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <p className="text-kindofwhite/70 font-fransisco text-sm">
                        © {new Date().getFullYear()} Capistor. All rights reserved.
                    </p>
                </motion.div>
            </div>
        </footer>
    );
}
