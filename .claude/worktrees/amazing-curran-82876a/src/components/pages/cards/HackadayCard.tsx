import { motion } from "framer-motion";

interface HackadayCardProps {
  profileUrl: string;
  profileName?: string;
}

export default function HackadayCard({ profileUrl, profileName = "" }: HackadayCardProps) {
  return (
    <motion.div
      className="bg-kindofwhite p-6 rounded-2xl border-2 border-capistor-300/20 max-w-md shadow-lg md:max-w-sm sm:max-w-xs"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-sexyblue/20 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-sexyblue"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
        </div>
        <h3 className="text-sexyblue font-helvetica font-bold">
          {profileName}
        </h3>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs px-4 py-2 bg-sexyblue text-kindofwhite rounded-lg font-domine text-sm hover:bg-capistor-600 transition-colors duration-200 text-center"
        >
          Visit Hackaday
        </a>
      </div>
    </motion.div>
  );
}