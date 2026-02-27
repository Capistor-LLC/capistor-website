import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useForm, ValidationError } from "@formspree/react";

export default function NewsletterSection() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [state, handleSubmit] = useForm("xaqdvrry");
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (state.succeeded) {
            setShowSuccess(true);
            const timer = setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state.succeeded]);

    return (
        <section className="py-12 bg-kindofwhite">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl w-full">
                <motion.div
                    className="p-4 sm:p-8 rounded-2xl border border-capistor-300/30 bg-sexyblue/5 shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                    transition={{ duration: 0.6 }}
                >
                    {showSuccess ? (
                        <motion.div
                            className="text-center py-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <motion.p
                                className="text-4xl mb-3"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5 }}
                            >
                                ✓
                            </motion.p>
                            <p className="text-sexyblue font-futura text-lg font-semibold">
                                Thanks for subscribing!
                            </p>
                            <p className="text-sexyblue/60 font-fransisco text-sm mt-1">
                                We'll keep you updated with new products and insights.
                            </p>
                        </motion.div>
                    ) : (
                        <div>
                            <div className="text-center mb-4 sm:mb-6">
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-futura font-bold text-black mb-2">
                                    Stay Updated
                                </h3>
                                <p className="text-sexyblue/60 font-fransisco text-xs sm:text-sm">
                                    Subscribe to get updates on new products and engineering insights
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    placeholder="your@email.com"
                                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-capistor-300/30 bg-kindofwhite text-black font-fransisco text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue"
                                />
                                <motion.button
                                    type="submit"
                                    disabled={state.submitting}
                                    className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg bg-sexyblue text-kindofwhite font-futura font-bold text-xs sm:text-sm transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {state.submitting ? "Subscribing..." : "Subscribe"}
                                </motion.button>
                            </form>

                            <ValidationError prefix="Email" field="email" errors={state.errors} />
                        </div>
                    )}
                </motion.div>

                <p className="text-center text-sexyblue/40 font-fransisco text-xs mt-4">
                    We respect your privacy. Unsubscribe at any time.
                </p>
            </div>
        </section>
    );
}
