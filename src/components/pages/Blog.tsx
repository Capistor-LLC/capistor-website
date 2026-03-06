import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import BlogCard from "../cards/BlogCard";
import { getAllBlogPosts } from "../../data/blogData";

export default function BlogSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const blogPosts = getAllBlogPosts();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="min-h-screen bg-kindofwhite py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
        <div className="flex flex-col items-center mb-16 sm:mb-20">
          {/* Header Section */}
          <motion.div
            className="text-center w-full mb-12 sm:mb-16"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -40 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-futura font-bold text-black mb-4">
              Engineering Stories
            </h1>
            <p className="text-sexyblue/60 text-lg sm:text-xl md:text-2xl font-futura max-w-3xl mx-auto">
              Deep dives into our projects, challenges, and engineering solutions
            </p>
          </motion.div>

          {/* Blog Grid */}
          <motion.div
            className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 40 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <BlogCard
                  id={post.id}
                  slug={post.slug}
                  title={post.title}
                  date={post.date}
                  excerpt={post.excerpt}
                  image={post.image}
                  category={post.category}
                  readTime={post.readTime}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
