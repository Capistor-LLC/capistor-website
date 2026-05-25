import { motion } from "framer-motion";

interface GitHubCardProps {
  profileUrl: string;
  profileName?: string;
}

export default function GitHubCard({ profileUrl, profileName = "" }: GitHubCardProps) {
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
            <path d="M12 2C6.475 2 2 6.475 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 7.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12c0-5.525-4.475-10-10-10z"/>
          </svg>
        </div>
        <h3 className=" text-sexyblue font-helvetica font-bold">
          {profileName}
        </h3>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-xs px-4 py-2 bg-sexyblue text-kindofwhite rounded-lg font-domine text-sm hover:bg-capistor-600 transition-colors duration-200 text-center"
        >
          Visit GitHub
        </a>
      </div>
    </motion.div>
  );
}