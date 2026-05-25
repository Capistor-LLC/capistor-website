import { motion } from "framer-motion";

interface FacebookCardProps {
  profileUrl: string;
  profileName?: string;
}

export default function FacebookCard({ profileUrl, profileName = "" }: FacebookCardProps) {
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
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
          Visit Facebook
        </a>
      </div>
    </motion.div>
  );
}