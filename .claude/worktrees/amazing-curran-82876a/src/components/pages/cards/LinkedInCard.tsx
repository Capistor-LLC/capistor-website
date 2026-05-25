import { motion } from "framer-motion";

interface LinkedInCardProps {
  profileUrl: string;
  profileName?: string;
}

export default function LinkedInCard({
  profileUrl,
  profileName = "",
}: LinkedInCardProps) {
  return (
    <motion.div
      className="bg-kindofwhite p-6 rounded-2xl border-2 border-capistor-300/20 max-w-md shadow-lg md:max-w-sm sm:max-w-xs"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.255-2.453-1.763-2.453-1.502 0-2.237 1.049-2.237 2.682v5.375h-3v-11h2.718v1.369h.038c.476-.862 1.351-1.763 2.788-1.763 2.978 0 3.524 1.897 3.524 4.392v6.002z"
              stroke="#000000"
            />{" "}
            {/* Black outline */}
            <path
              d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-1.337-.255-2.453-1.763-2.453-1.502 0-2.237 1.049-2.237 2.682v5.375h-3v-11h2.718v1.369h.038c.476-.862 1.351-1.763 2.788-1.763 2.978 0 3.524 1.897 3.524 4.392v6.002z"
              fill="#FFFFFF"
            />{" "}
            {/* White inner shape */}
          </svg>
        </div>
        <h3 className="text-sexyblue font-helvetica font-bold">
          {profileName}
        </h3>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs px-4 py-2 bg-sexyblue text-kindofwhite rounded-lg font-domine text-sm hover:bg-capistor-600 transition-colors duration-200 text-center">
          Visit LinkedIn
        </a>
      </div>
    </motion.div>
  );
}
