import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const ProductsDemoSection = () => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const videos = [
    {
      title: "RGB Laser Projector",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem suscipit, perspiciatis qui, tempora, rem dignissimos excepturi.",
      youtubeId: "OeCiUrM3IVg",
    },
    {
      title: "Automatic Incubator",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem suscipit, perspiciatis qui, tempora, rem dignissimos excepturi.",
      youtubeId: "sc9On_JUxrM",
    },
    {
      title: "Sign Language Translator",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem suscipit, perspiciatis qui, tempora, rem dignissimos excepturi.",
      youtubeId: "3VuZNzqLfqo",
    },
  ];

  const closePopup = () => setSelectedVideo(null);

  return (
    <section
      id="demoproducts"
      className="min-h-screen flex items-center justify-center bg-kindofwhite pt-64 md:py-16">
      <div className="container px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-black text-center mb-6 md:mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          Demo
        </motion.h2>

        <div className="grid grid-cols-1 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={index}
              className="bg-kindofwhite flex flex-row items-center rounded-xl shadow-lg border-2 border-capistor-300/20 cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => setSelectedVideo(video.youtubeId)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}>
              {/* Thumbnail */}
              <div className="relative flex-shrink-0 group">
                <img
                  src={`https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`}
                  alt={`${video.title} Thumbnail`}
                  className="w-32 h-28 sm:w-40 sm:h-36 md:w-56 md:h-44 lg:w-60 lg:h-48 object-cover rounded-l-xl"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://img.youtube.com/vi/${video.youtubeId}/0.jpg`;
                    target.onerror = () => {
                      target.src =
                        "https://via.placeholder.com/480x360?text=No+Thumbnail";
                    };
                  }}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-40 group-hover:opacity-100 transition-opacity duration-300 rounded-l-xl">
                  <div className="bg-white/90 rounded-full p-4 shadow-lg">
                    <svg
                      className="w-8 h-8 text-sexyblue"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Text Section */}
              <div className="flex flex-col justify-center px-2 sm:px-4 py-2 md:py-4 flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl md:text-2xl font-futura font-bold text-black mb-1 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sexyblue/90 text-xs sm:text-sm md:text-base font-fransisco leading-relaxed line-clamp-3">
                  {video.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Video Popup */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePopup}>
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full max-w-5xl max-h-[70vh] rounded-xl shadow-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProductsDemoSection;
