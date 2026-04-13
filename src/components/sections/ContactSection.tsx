import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { trackContactFormSubmit } from "../../utils/facebookPixel";

export default function ContactSection() {
    const [state, handleSubmit] = useForm("xaqdvrry");
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (state.succeeded) {
            trackContactFormSubmit();
            setShowSuccess(true);
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state.succeeded]);

    return (
        <section id="contact" className="min-h-screen flex items-center bg-kindofwhite py-6 sm:py-12">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-2xl w-full">
                <motion.div
                    className="text-center mb-6 sm:mb-8"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-futura font-bold text-black mb-2">
                        Get in Touch
                    </h2>
                    <p className="text-sexyblue/60 text-xs sm:text-base font-futura">
                        Tell us about your project or product inquiry
                    </p>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    className="p-4 sm:p-6 rounded-2xl border border-capistor-300/30 bg-kindofwhite shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    {showSuccess ? (
                        <motion.div
                            className="text-center py-8"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.p
                                className="text-4xl mb-4"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                            >
                                ✓
                            </motion.p>
                            <p className="text-sexyblue font-futura text-lg font-semibold mb-2">
                                Message sent successfully!
                            </p>
                            <p className="text-sexyblue/60 font-fransisco text-sm">
                                We'll get back to you as soon as possible.
                            </p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-black font-futura font-semibold mb-1 text-xs sm:text-sm">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-capistor-300/30 bg-kindofwhite/50 text-black font-fransisco text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue"
                                    placeholder="Your name"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-black font-futura font-semibold mb-1 text-xs sm:text-sm">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-capistor-300/30 bg-kindofwhite/50 text-black font-fransisco text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue"
                                    placeholder="your@email.com"
                                />
                                <ValidationError prefix="Email" field="email" errors={state.errors} />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-black font-futura font-semibold mb-1 text-xs sm:text-sm">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-capistor-300/30 bg-kindofwhite/50 text-black font-fransisco text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue"
                                    placeholder="+971 50 XXXX XXXX"
                                />
                            </div>

                            {/* Inquiry Type */}
                            <div>
                                <label className="block text-black font-futura font-semibold mb-1 text-xs sm:text-sm">
                                    Inquiry Type
                                </label>
                                <select
                                    name="inquiryType"
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-capistor-300/30 bg-kindofwhite/50 text-black font-fransisco text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue"
                                >
                                    <option value="custom">Custom Engineering Project</option>
                                    <option value="product">Product Inquiry</option>
                                </select>
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-black font-futura font-semibold mb-1 text-xs sm:text-sm">
                                    Message
                                </label>
                                <textarea
                                    name="message"
                                    required
                                    rows={2}
                                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-capistor-300/30 bg-kindofwhite/50 text-black font-fransisco text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue resize-none"
                                    placeholder="Tell us more about your project or product needs..."
                                ></textarea>
                                <ValidationError prefix="Message" field="message" errors={state.errors} />
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={state.submitting}
                                className="w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-sexyblue text-kindofwhite font-futura font-bold text-xs sm:text-sm transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {state.submitting ? "Sending..." : "Send Inquiry"}
                            </motion.button>
                        </form>
                    )}

                    {/* Contact Info */}
                    {!showSuccess && (
                        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-capistor-300/20">
                            <p className="text-center text-sexyblue/60 font-fransisco text-xs mb-2 sm:mb-3">
                                Or reach out directly:
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 text-center text-xs sm:text-sm">
                                <a
                                    href="mailto:shoaib@capistor.com"
                                    className="text-sexyblue hover:text-black font-futura font-semibold transition-colors break-all"
                                >
                                    shoaib@capistor.com
                                </a>
                                <a
                                    href="tel:+971508726178"
                                    className="text-sexyblue hover:text-black font-futura font-semibold transition-colors"
                                >
                                    +971 508 726 178
                                </a>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
