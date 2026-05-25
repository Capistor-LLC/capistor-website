import { motion } from "framer-motion";

interface YouTubeCardProps {
  channelUrl: string;
  channelName?: string;
}

export default function YouTubeCard({
  channelUrl,
  channelName = "",
}: YouTubeCardProps) {
  return (
    <motion.div
      className="bg-kindofwhite p-6 rounded-2xl border-2 border-capistor-300/20 max-w-md shadow-lg md:max-w-sm sm:max-w-xs"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505a3.017 3.017 0 0 0-2.122 2.136C.5 6.967.5 12 .5 12s0 5.033.505 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C23.5 17.033 23.5 12 23.5 12s0-5.033-.502-5.814z"
              stroke="#000000" /> {/* Black outline */}
            <path
              d="M9.545 15.568V8.432L15.818 12v1.568L9.545 15.568z"
              fill="#FFFFFF" /> {/* White play button */}
          </svg>
        </div>
        <h3 className="text-sexyblue font-helvetica font-bold">
          {channelName}
        </h3>
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs px-4 py-2 bg-sexyblue text-kindofwhite rounded-lg font-domine text-sm hover:bg-capistor-600 transition-colors duration-200 text-center">
          Watch on YouTube
        </a>
      </div>
    </motion.div>
  );
}