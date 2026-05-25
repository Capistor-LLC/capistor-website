import { motion } from "framer-motion";
import { useState } from "react";

const videos = [
  {
    title: "Restaurant Table Pager — Overview",
    description: "Wireless table pager system featuring intuitive LED feedback and long-range connectivity.",
    videoId: "https://www.youtube.com/embed/VIeEeR6Vgy0",
  },
  {
    title: "Restaurant Table Pager — Additional Demo",
    description: "Additional product demonstration showcasing real-world deployment.",
    videoId: "https://www.youtube.com/embed/_AZtMK0oLWA",
  },
];

export default function VideoSection() {
  const [selectedVideo, setSelectedVideo] = useState(0);

  return (
    <section className="bg-sexyblue py-14 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl w-full">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-kindofwhite">
            See It In Action
          </h2>
          <p className="text-kindofwhite/50 text-lg sm:text-xl font-futura mt-2">
            Product demonstrations from real deployments
          </p>
        </motion.div>

        <div className="flex flex-col items-center">
          <motion.div
            className="w-full max-w-4xl mb-6"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-black/30 rounded-2xl border border-kindofwhite/10 overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={videos[selectedVideo].videoId}
                title={videos[selectedVideo].title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              />
            </div>
            <p className="text-kindofwhite/60 font-fransisco text-sm mt-3 text-center">
              {videos[selectedVideo].description}
            </p>
          </motion.div>

          {videos.length > 1 && (
            <motion.div
              className="w-full max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.map((video, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedVideo(index)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedVideo === index
                        ? "border-kindofwhite/50 bg-kindofwhite/10"
                        : "border-kindofwhite/10 bg-kindofwhite/5 hover:border-kindofwhite/30"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl text-kindofwhite/60">▶</div>
                      <div>
                        <p className="text-kindofwhite/50 font-futura text-xs font-bold uppercase tracking-wide">
                          Video {index + 1}
                        </p>
                        <p className="text-kindofwhite font-futura text-sm font-semibold line-clamp-2">
                          {video.title}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          <motion.div
            className="w-full max-w-4xl mt-8 p-5 rounded-xl bg-kindofwhite/5 border border-kindofwhite/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-kindofwhite/60 font-fransisco text-sm leading-relaxed">
              <span className="font-futura font-bold text-kindofwhite/80">Portfolio Project:</span>{" "}
              Designed for a client. Images and technical details are shared for portfolio purposes only.
              Not for sale — all rights and intellectual property belong to the original client.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
