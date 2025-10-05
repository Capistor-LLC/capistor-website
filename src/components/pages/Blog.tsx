import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import BlogCard from "./cards/BlogCard";

export default function BlogSection() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const blogPosts = [
    {
      title: "Building a Laser Projector",
      date: "Sep 15, 2025",
      excerpt:
        "A deep dive into designing and coding a custom laser projection system.",
      image: "/product_images/chicken.jpg",
    },
    {
      title: "Optimizing Drone Navigation",
      date: "Sep 22, 2025",
      excerpt:
        "Exploring advanced techniques for precision drone flight in agriculture.",
      image: "/product_images/iphone.jpg",
    },
    {
      title: "PCB Design Tips for Beginners",
      date: "Sep 28, 2025",
      excerpt:
        "Essential guide to creating reliable printed circuit boards.",
      image: "/product_images/iphone2.jpg",
    },
  ];

  return (
    <section className="min-h-screen text-sexyblue flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl w-full">
        <div className="relative top-16 md:top-0 h-screen">
          <div className="flex flex-col h-full justify-center">
            <div className="w-full mt-16 sm:p-6 md:p-8 lg:p-12 flex flex-col items-center text-center">
              <motion.div
                className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold mb-6 sm:mt-10 md:mt-4  sm:mb-8 md:mb-12"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -50 }}
                transition={{ duration: 0.6 }}>
                <h1>My Blog</h1>
                <p className="text-sexyblue/40 text-lg sm:text-xl md:text-2xl font-futura max-w-2xl mx-auto ">Follow my journey.</p>
              </motion.div>
              <div className="flex flex-col md:flex-row gap-6 sm:gap-2 md:gap-10">
                {blogPosts.map((post, index) => (
                  <BlogCard
                    key={index}
                    title={post.title}
                    text={post.excerpt}
                    imageSrc={post.image}
                    buttonText="Read More"
                    onClick={() => console.log(`Navigate to ${post.title}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}