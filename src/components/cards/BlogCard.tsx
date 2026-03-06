import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface BlogCardProps {
    id: string;
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    image: string;
    category: string;
    readTime: string;
}

export default function BlogCard({
    slug,
    title,
    date,
    excerpt,
    image,
    category,
    readTime,
}: BlogCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="group"
        >
            <Link to={`/blog/${slug}`}>
                <div className="bg-white rounded-2xl border-2 border-capistor-300/20 overflow-hidden hover:border-sexyblue/40 transition-all duration-300 shadow-sm hover:shadow-lg h-full flex flex-col">
                    {/* Image Container */}
                    <div className="relative overflow-hidden h-48 sm:h-56 md:h-64 bg-kindofwhite">
                        <motion.img
                            src={image}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3C/svg%3E";
                            }}
                        />
                        <div className="absolute top-3 right-3">
                            <span className="inline-block bg-sexyblue/90 text-white text-xs font-futura font-bold px-3 py-1 rounded-full">
                                {category}
                            </span>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="flex-1 p-4 sm:p-5 md:p-6 flex flex-col">
                        {/* Date and Read Time */}
                        <div className="flex items-center justify-between text-xs sm:text-sm text-sexyblue/60 font-fransisco mb-2">
                            <span>{date}</span>
                            <span>{readTime}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg sm:text-xl md:text-xl font-futura font-bold text-black mb-2 line-clamp-2 group-hover:text-sexyblue transition-colors">
                            {title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-sm md:text-base text-sexyblue/70 font-fransisco leading-relaxed mb-4 flex-1 line-clamp-3">
                            {excerpt}
                        </p>

                        {/* Read More Button */}
                        <div className="mt-auto">
                            <button className="inline-flex items-center gap-2 text-sexyblue font-futura font-bold text-sm group-hover:gap-3 transition-all">
                                Read More
                                <span className="text-lg">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
