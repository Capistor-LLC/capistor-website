import { motion } from "framer-motion";

interface ThoughtBubbleProps {
    text: string;
    show: boolean;
}

export default function ThoughtBubble({ text, show }: ThoughtBubbleProps) {
    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-30"
        >
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-xl border border-kindofwhite/20 relative">
                <p className="text-kindofwhite font-domine font-bold text-sm whitespace-nowrap">
                    {text}
                </p>
                {/* Bubble tail */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/95"></div>
            </div>
        </motion.div>
    );
}