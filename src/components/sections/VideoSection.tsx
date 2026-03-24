import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function VideoSection() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(0);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const videos = [
        {
            title: "Restaurant Table Pager Overview",
            description: "Additional product demonstration.",
            videoId: "https://www.youtube.com/embed/VIeEeR6Vgy0",
            thumbnail: "Video Demo 1",
        },
        {
            title: "Restaurant Table Pager Overview Additiional",
            description: "Wireless table pager system featuring intuitive LED feedback and long-range connectivity.",
            videoId: "https://www.youtube.com/embed/_AZtMK0oLWA",
            thumbnail: "Video Demo 2",
        },
    ];

    return (
        <section className="bg-kindofwhite py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full">
                <div className="flex flex-col items-center">
                    {/* Main Video */}
                    <motion.div
                        className="w-full max-w-4xl mb-8"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.95 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-sexyblue/5 rounded-2xl border-2 border-capistor-300/30 overflow-hidden flex items-center justify-center">
                            {videos[selectedVideo].videoId.startsWith("http") ? (
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={videos[selectedVideo].videoId}
                                    title={videos[selectedVideo].title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="absolute inset-0"
                                ></iframe>
                            ) : (
                                <div className="text-center p-8">
                                    <div className="text-6xl mb-4">▶</div>
                                    <p className="text-sexyblue/60 font-fransisco text-base">
                                        {videos[selectedVideo].thumbnail}
                                    </p>
                                    <p className="text-sexyblue/40 font-futura text-sm mt-2">
                                        [Add YouTube or video link]
                                    </p>
                                </div>
                            )}
                        </div>

                    </motion.div>

                    {/* Video Selector - Only show if multiple videos */}
                    {videos.length > 1 && (
                        <motion.div
                            className="w-full max-w-4xl"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {videos.map((video, index) => (
                                    <motion.button
                                        key={index}
                                        onClick={() => setSelectedVideo(index)}
                                        className={`p-4 rounded-xl border-2 transition-all ${selectedVideo === index
                                            ? "border-sexyblue bg-sexyblue/5"
                                            : "border-capistor-300/30 bg-kindofwhite hover:border-capistor-300/60"
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center gap-3 justify-start">
                                            <div className="text-2xl">▶</div>
                                            <div className="text-left">
                                                <p className="text-sexyblue font-futura text-xs font-bold uppercase tracking-wide">
                                                    Video {index + 1}
                                                </p>
                                                <p className="text-black font-futura text-sm font-semibold line-clamp-2">
                                                    {video.title}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Portfolio Disclaimer */}
                    <motion.div
                        className="w-full max-w-4xl mt-8 p-6 rounded-lg bg-sexyblue/5 border-2 border-sexyblue/20"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <p className="text-sexyblue/90 font-fransisco text-sm leading-relaxed">
                            <span className="font-futura font-bold text-sexyblue">Portfolio Project:</span> This is a product designed for a client. Images and technical details are shared for portfolio purposes only. This product is not for sale—all rights and intellectual property belong to the original client.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
