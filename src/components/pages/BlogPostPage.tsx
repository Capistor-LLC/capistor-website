import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBlogPostBySlug, getAllBlogPosts, BlogPost } from "../../data/blogData";
import ReactMarkdown from "react-markdown";
import BlogTableOfContents from "../BlogTableOfContents";

interface Heading {
    id: string;
    level: number;
    text: string;
}

function extractHeadings(content: string): Heading[] {
    const headingsRegex = /^#{2,3}\s+(.+)$/gm;
    const headings: Heading[] = [];
    let match;

    while ((match = headingsRegex.exec(content)) !== null) {
        const level = match[0].indexOf(" ");
        const text = match[1];
        const id = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-");
        headings.push({ id, level, text });
    }

    return headings;
}

function generateId(text: string): string {
    return String(text)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
}

function getTextContent(children: any): string {
    if (!children) return "";
    if (typeof children === "string") return children;
    if (Array.isArray(children)) {
        return children.map((child) => getTextContent(child)).join("");
    }
    if (children.props?.children) {
        return getTextContent(children.props.children);
    }
    return "";
}

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);
    const [post, setPost] = useState<BlogPost | null>(null);
    const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
    const [headings, setHeadings] = useState<Heading[]>([]);

    useEffect(() => {
        if (slug) {
            const foundPost = getBlogPostBySlug(slug);
            if (foundPost) {
                setPost(foundPost);
                setHeadings(extractHeadings(foundPost.content));
                // Get related posts (same category, different post)
                const related = getAllBlogPosts()
                    .filter((p: BlogPost) => p.category === foundPost.category && p.id !== foundPost.id)
                    .slice(0, 2);
                setRelatedPosts(related);
                setIsLoaded(true);
                // Scroll to top
                window.scrollTo(0, 0);
            } else {
                navigate("/");
            }
        }
    }, [slug, navigate]);

    if (!post) {
        return (
            <section className="min-h-screen bg-kindofwhite flex items-center justify-center">
                <div className="text-sexyblue font-domine text-xl">Loading...</div>
            </section>
        );
    }

    // Find previous and next posts for navigation
    const allPosts = getAllBlogPosts();
    const currentIndex = allPosts.findIndex((p: BlogPost) => p.id === post?.id);
    const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

    return (
        <div className="bg-kindofwhite">
            {/* Hero Section with Image */}
            <motion.section
                className="relative w-full bg-kindofwhite h-72 sm:h-96 md:h-[500px] overflow-hidden flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="relative w-full px-4 sm:px-6 lg:px-8 max-w-4xl h-full">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'%3E%3Crect fill='%23e0e0e0' width='800' height='500'/%3E%3C/svg%3E";
                        }}
                    />
                </div>

                {/* Back Button */}
                <motion.button
                    onClick={() => {
                        navigate("/");
                        // Scroll to blog section after navigation
                        setTimeout(() => {
                            const blogSection = document.getElementById("blog-section");
                            if (blogSection) {
                                blogSection.scrollIntoView({ behavior: "smooth" });
                            }
                        }, 100);
                    }}
                    className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/90 hover:bg-white text-black px-4 sm:px-6 py-2 sm:py-3 rounded-full font-futura font-bold text-sm sm:text-base flex items-center gap-2 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    ← Back
                </motion.button>
            </motion.section>

            {/* Main Content */}
            <motion.section
                className="py-12 sm:py-16 md:py-20"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 40 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="relative w-full">
                    <BlogTableOfContents headings={headings} />

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl w-full">
                        {/* Main Article Content */}
                        <div className="w-full">
                            {/* Post Header */}
                            <div className="mb-8 sm:mb-12">
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <span className="inline-block bg-sexyblue/10 border border-sexyblue/30 text-sexyblue text-xs sm:text-sm font-futura font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                                        {post.category}
                                    </span>
                                    <span className="text-sexyblue/60 text-xs sm:text-sm font-fransisco">
                                        {post.date}
                                    </span>
                                    <span className="text-sexyblue/60 text-xs sm:text-sm font-fransisco">
                                        {post.readTime}
                                    </span>
                                </div>

                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-futura font-bold text-black mb-4 sm:mb-6 leading-tight">
                                    {post.title}
                                </h1>

                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-sexyblue/20 rounded-full flex items-center justify-center">
                                        <span className="text-sexyblue font-futura font-bold">C</span>
                                    </div>
                                    <div>
                                        <p className="font-futura font-bold text-black">{post.author}</p>
                                        <p className="text-sexyblue/60 text-sm font-fransisco">Engineering Team</p>
                                    </div>
                                </div>
                            </div>

                            {/* Article Content */}
                            <motion.article
                                className="prose prose-invert max-w-none"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isLoaded ? 1 : 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <div className="space-y-6 sm:space-y-8">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ node, ...props }) => (
                                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-futura font-bold text-black mt-12 mb-6 leading-tight" {...props} />
                                            ),
                                            h2: ({ node, ...props }: any) => {
                                                const text = getTextContent(props.children);
                                                const id = generateId(text);
                                                return (
                                                    <h2 id={id} className="text-2xl sm:text-3xl md:text-4xl font-futura font-bold text-sexyblue mt-10 mb-5 pb-3 border-b-2 border-sexyblue/20 leading-tight" {...props} />
                                                );
                                            },
                                            img: ({ node, ...props }: any) => (
                                                <figure className="my-8 sm:my-12">
                                                    <motion.img
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        whileInView={{ opacity: 1, scale: 1 }}
                                                        transition={{ duration: 0.5 }}
                                                        viewport={{ once: true }}
                                                        className="w-full h-auto rounded-2xl border-2 border-sexyblue/20 shadow-lg hover:shadow-xl transition-shadow"
                                                        {...props}
                                                    />
                                                    {props.alt && (
                                                        <figcaption className="text-center text-sm sm:text-base text-sexyblue/70 font-fransisco mt-3 italic">
                                                            {props.alt}
                                                        </figcaption>
                                                    )}
                                                </figure>
                                            ),
                                            h3: ({ node, ...props }: any) => {
                                                const text = getTextContent(props.children);
                                                const id = generateId(text);
                                                return (
                                                    <h3 id={id} className="text-xl sm:text-2xl md:text-2xl font-futura font-bold text-black mt-8 mb-4 leading-tight" {...props} />
                                                );
                                            },
                                            h4: ({ node, ...props }) => (
                                                <h4 className="text-lg sm:text-xl font-futura font-bold text-sexyblue mt-6 mb-3" {...props} />
                                            ),
                                            p: ({ node, ...props }) => (
                                                <p className="font-fransisco text-sexyblue/85 text-base sm:text-lg leading-8 mb-6" {...props} />
                                            ),
                                            strong: ({ node, ...props }) => (
                                                <strong className="font-bold text-black font-fransisco" {...props} />
                                            ),
                                            em: ({ node, ...props }) => (
                                                <em className="italic text-sexyblue font-fransisco" {...props} />
                                            ),
                                            ul: ({ node, ...props }) => (
                                                <ul className="list-disc list-inside space-y-3 font-fransisco text-sexyblue/85 text-base sm:text-lg mb-6 pl-4" {...props} />
                                            ),
                                            ol: ({ node, ...props }) => (
                                                <ol className="list-decimal list-inside space-y-3 font-fransisco text-sexyblue/85 text-base sm:text-lg mb-6 pl-4" {...props} />
                                            ),
                                            li: ({ node, ...props }) => (
                                                <li className="font-fransisco text-sexyblue/85 leading-7" {...props} />
                                            ),
                                            blockquote: ({ node, ...props }) => (
                                                <blockquote className="border-l-4 border-sexyblue bg-sexyblue/5 italic px-6 py-4 rounded-r-lg my-6 font-fransisco text-sexyblue/80 text-base sm:text-lg" {...props} />
                                            ),
                                            code: ({ node, inline, ...props }: any) =>
                                                inline ? (
                                                    <code className="bg-sexyblue/10 text-sexyblue px-2 py-1 rounded font-mono text-sm font-bold" {...props} />
                                                ) : (
                                                    <code className="block bg-sexyblue/5 border-l-4 border-sexyblue text-sexyblue px-4 py-4 rounded-r font-mono text-sm overflow-x-auto mb-6" {...props} />
                                                ),
                                            pre: ({ node, ...props }) => (
                                                <pre className="bg-sexyblue/5 border-2 border-sexyblue/20 rounded-lg p-4 overflow-x-auto mb-6 font-mono text-sm" {...props} />
                                            ),
                                            table: ({ node, ...props }) => (
                                                <table className="w-full border-collapse mb-6 text-sm sm:text-base" {...props} />
                                            ),
                                            thead: ({ node, ...props }) => (
                                                <thead className="bg-sexyblue/10" {...props} />
                                            ),
                                            th: ({ node, ...props }) => (
                                                <th className="border-2 border-sexyblue/20 p-3 text-left font-futura font-bold text-sexyblue" {...props} />
                                            ),
                                            td: ({ node, ...props }) => (
                                                <td className="border border-sexyblue/20 p-3 font-fransisco text-sexyblue/80" {...props} />
                                            ),
                                            a: ({ node, ...props }) => (
                                                <a className="text-sexyblue font-semibold underline hover:text-sexyblue/70 transition-colors" {...props} />
                                            ),
                                        }}
                                    >
                                        {post.content}
                                    </ReactMarkdown>
                                </div>
                            </motion.article>

                            {/* Share Section */}
                            <motion.div
                                className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t-2 border-capistor-300/20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isLoaded ? 1 : 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
                                    <div>
                                        <h3 className="font-futura font-bold text-black mb-2">Share this article</h3>
                                        <div className="flex gap-3">
                                            <motion.a
                                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title + ' - ' + window.location.href)}`}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="w-10 h-10 rounded-full bg-sexyblue text-white flex items-center justify-center hover:bg-sexyblue/80 transition-all font-bold"
                                                title="Share on Twitter"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                𝕏
                                            </motion.a>
                                            <motion.a
                                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                                                target="_blank"
                                                rel="noreferrer noopener"
                                                className="w-10 h-10 rounded-full bg-sexyblue text-white flex items-center justify-center hover:bg-sexyblue/80 transition-all font-bold"
                                                title="Share on LinkedIn"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                in
                                            </motion.a>
                                        </div>
                                    </div>
                                    <div className="text-sm text-sexyblue/60 font-fransisco">
                                        {post.content.split(" ").length} words • {post.readTime}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Related Posts Section */}
            {relatedPosts.length > 0 && (
                <motion.section
                    className="py-12 sm:py-16 md:py-20 border-t-2 border-capistor-300/20"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 40 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-futura font-bold text-black mb-8 sm:mb-12">
                            Related Articles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                                    <motion.div
                                        className="bg-white rounded-2xl border-2 border-capistor-300/20 overflow-hidden hover:border-sexyblue/40 transition-all cursor-pointer group"
                                        whileHover={{ y: -8 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="relative overflow-hidden h-48 sm:h-56">
                                            <img
                                                src={relatedPost.image}
                                                alt={relatedPost.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-4 sm:p-6">
                                            <h3 className="font-futura font-bold text-black text-lg mb-2 group-hover:text-sexyblue transition-colors line-clamp-2">
                                                {relatedPost.title}
                                            </h3>
                                            <p className="text-sexyblue/60 text-sm font-fransisco">{relatedPost.date}</p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </motion.section>
            )}

            {/* Navigation Between Posts */}
            <motion.section
                className="py-12 sm:py-16 md:py-20 border-t-2 border-capistor-300/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {prevPost ? (
                            <Link to={`/blog/${prevPost.slug}`}>
                                <motion.button
                                    className="w-full p-4 sm:p-6 rounded-xl border border-sexyblue/15 hover:border-sexyblue/35 transition-all text-left"
                                    whileHover={{ x: -8 }}
                                >
                                    <p className="text-sexyblue/60 font-futura text-xs sm:text-sm font-bold uppercase tracking-wide mb-2">
                                        ← Previous Article
                                    </p>
                                    <p className="font-futura font-bold text-black text-base sm:text-lg line-clamp-2">
                                        {prevPost.title}
                                    </p>
                                </motion.button>
                            </Link>
                        ) : (
                            <div></div>
                        )}

                        {nextPost ? (
                            <Link to={`/blog/${nextPost.slug}`}>
                                <motion.button
                                    className="w-full p-4 sm:p-6 rounded-xl border border-sexyblue/15 hover:border-sexyblue/35 transition-all text-right"
                                    whileHover={{ x: 8 }}
                                >
                                    <p className="text-sexyblue/60 font-futura text-xs sm:text-sm font-bold uppercase tracking-wide mb-2">
                                        Next Article →
                                    </p>
                                    <p className="font-futura font-bold text-black text-base sm:text-lg line-clamp-2">
                                        {nextPost.title}
                                    </p>
                                </motion.button>
                            </Link>
                        ) : (
                            <div></div>
                        )}
                    </div>
                </div>
            </motion.section>
        </div>
    );
}
