import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase, DbBlogPost } from "../../lib/supabase";
import { formatDate } from "../../lib/blog";

export default function BlogSection() {
  const [posts, setPosts] = useState<DbBlogPost[] | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      setPosts(data ?? []);
    })();
  }, []);

  return (
    <section className="min-h-screen bg-kindofwhite py-14 sm:py-20 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl w-full">
        <motion.div
          className="flex items-end justify-between mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="text-sexyblue/35 font-futura text-xs uppercase tracking-[0.2em] mb-2">
              Writing
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-futura font-bold text-black">
              From the blog
            </h2>
          </div>
          <Link
            to="/blog"
            className="text-sexyblue hover:text-black font-futura text-sm transition-colors"
          >
            All posts →
          </Link>
        </motion.div>

        {posts === null ? (
          <p className="text-sexyblue/40 font-fransisco">Loading…</p>
        ) : posts.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-capistor-300/50 text-center">
            <p className="text-sexyblue/55 font-fransisco">
              First posts coming soon. Subscribe in the footer to be notified.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group"
              >
                <Link to={`/blog/${post.slug}`} className="block">
                  {post.cover_url ? (
                    <div className="aspect-[16/10] rounded-xl overflow-hidden bg-capistor-100 mb-4">
                      <img
                        src={post.cover_url}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-capistor-100 to-capistor-200 mb-4" />
                  )}
                  <h3 className="font-domine font-bold text-black text-xl leading-snug mb-2 group-hover:text-sexyblue transition-colors">
                    {post.title}
                  </h3>
                  {post.subtitle && (
                    <p className="text-sexyblue/60 font-fransisco text-sm mb-2 line-clamp-2">
                      {post.subtitle}
                    </p>
                  )}
                  <p className="text-sexyblue/35 font-futura text-xs">
                    {post.published_at && formatDate(post.published_at)}
                    {" · "}
                    {post.reading_minutes ?? 1} min read
                  </p>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
