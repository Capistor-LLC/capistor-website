import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase, DbBlogPost } from "../../lib/supabase";
import { formatDate } from "../../lib/blog";
import Seo from "../ui/Seo";
import { BlogIndexSkeleton } from "../ui/Skeleton";

export default function BlogIndex() {
  const [posts, setPosts] = useState<DbBlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false });
      if (error) {
        setError(error.message);
        setPosts([]);
        return;
      }
      setPosts(data ?? []);
    })();
  }, []);

  const allTags = useMemo(() => {
    if (!posts) return [];
    const set = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [posts]);

  const filtered = useMemo(() => {
    if (!posts) return null;
    if (!activeTag) return posts;
    return posts.filter((p) => p.tags.includes(activeTag));
  }, [posts, activeTag]);

  const featured = filtered?.find((p) => p.is_featured);
  const rest = filtered?.filter((p) => p !== featured) ?? [];

  return (
    <div className="bg-white min-h-screen">
      <Seo
        title="Notes & tutorials — Capistor Blog"
        description="Thoughts on hardware, embedded systems, and the craft of building product. By the team at Capistor Technologies."
        url="/blog"
      />
      {/* Hero */}
      <section className="pt-28 pb-10 sm:pt-32 sm:pb-12 lg:pt-40 lg:pb-16 px-5 sm:px-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-400 font-futura text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.25em] mb-3 sm:mb-4">
            Capistor — Writing
          </p>
          <h1 className="text-[2.5rem] sm:text-6xl lg:text-7xl font-domine font-bold text-black leading-[1.05] tracking-tight mb-3 sm:mb-4">
            Notes & tutorials
          </h1>
          <p className="text-gray-500 font-fransisco text-base sm:text-xl leading-relaxed">
            Thoughts on hardware, embedded systems, and the craft of building product —
            written between projects.
          </p>
        </div>
      </section>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="border-b border-gray-100 sticky top-[88px] z-30 bg-white/90 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6 py-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-1 items-center">
              <button
                onClick={() => setSearchParams({})}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full font-futura text-xs transition-colors ${
                  !activeTag
                    ? "bg-black text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchParams({ tag })}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full font-futura text-xs transition-colors ${
                    activeTag === tag
                      ? "bg-black text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-3xl mx-auto p-4 mt-6 rounded-lg bg-red-50 border border-red-200 text-red-700 font-fransisco text-sm">
          {error}
        </div>
      )}

      {/* Posts */}
      <section className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
        {filtered === null ? (
          <BlogIndexSkeleton />
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 font-fransisco py-20 text-center">
            No posts {activeTag ? `tagged "${activeTag}"` : "yet"}.
          </p>
        ) : (
          <>
            {featured && (
              <FeaturedCard post={featured} />
            )}

            <div className={`space-y-10 ${featured ? "mt-12" : ""}`}>
              {rest.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function FeaturedCard({ post }: { post: DbBlogPost }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b border-gray-200 pb-12"
    >
      <p className="text-gray-400 font-futura text-[10px] uppercase tracking-[0.2em] mb-4">
        Featured
      </p>
      <Link to={`/blog/${post.slug}`} className="group block">
        {post.cover_url && (
          <div className="aspect-[16/9] rounded-lg overflow-hidden bg-gray-100 mb-6">
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
        )}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-domine font-bold text-black leading-tight mb-3 group-hover:text-gray-700 transition-colors">
          {post.title}
        </h2>
        {post.subtitle && (
          <p className="text-gray-500 font-fransisco text-lg sm:text-xl leading-snug mb-4">
            {post.subtitle}
          </p>
        )}
        <p className="text-gray-600 font-fransisco text-base leading-relaxed mb-4">
          {post.excerpt}
        </p>
        <PostMeta post={post} />
      </Link>
    </motion.article>
  );
}

function PostCard({ post, index }: { post: DbBlogPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className="border-b border-gray-100 pb-10"
    >
      <Link to={`/blog/${post.slug}`} className="group block sm:flex sm:gap-8 sm:items-start">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-domine font-bold text-black leading-snug mb-2 group-hover:text-gray-700 transition-colors">
            {post.title}
          </h2>
          {post.subtitle && (
            <p className="text-gray-500 font-fransisco text-base mb-2">{post.subtitle}</p>
          )}
          <p className="text-gray-500 font-fransisco text-sm leading-relaxed mb-3 line-clamp-2">
            {post.excerpt}
          </p>
          <PostMeta post={post} />
        </div>
        {post.cover_url && (
          <div className="hidden sm:block w-40 h-28 lg:w-48 lg:h-32 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 mt-1">
            <img
              src={post.cover_url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
            />
          </div>
        )}
      </Link>
    </motion.article>
  );
}

function PostMeta({ post }: { post: DbBlogPost }) {
  return (
    <div className="flex items-center gap-3 text-xs text-gray-400 font-futura flex-wrap">
      {post.published_at && <span>{formatDate(post.published_at)}</span>}
      <span>·</span>
      <span>{post.reading_minutes ?? 1} min read</span>
      {post.tags.length > 0 && (
        <>
          <span>·</span>
          <span>{post.tags.slice(0, 2).join(" · ")}</span>
        </>
      )}
    </div>
  );
}
