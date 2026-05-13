import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { supabase, DbBlogPost, DbBlogSeries } from "../../lib/supabase";
import { formatDate } from "../../lib/blog";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

interface PostWithSeries extends DbBlogPost {
  series: DbBlogSeries | null;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostWithSeries | null | undefined>(undefined);
  const [seriesPosts, setSeriesPosts] = useState<DbBlogPost[]>([]);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*, series:blog_series(*)")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) {
        console.warn(error);
        setPost(null);
        return;
      }
      setPost((data as PostWithSeries) ?? null);

      if (data?.series_id) {
        const { data: sibs } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("series_id", data.series_id)
          .eq("is_published", true)
          .order("series_position", { ascending: true, nullsFirst: false });
        setSeriesPosts(sibs ?? []);
      } else {
        setSeriesPosts([]);
      }
    })();
  }, [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (post === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400 font-fransisco">Loading…</p>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-gray-400 font-futura text-xs uppercase tracking-[0.2em] mb-3">
          404
        </p>
        <h1 className="text-3xl font-domine font-bold text-black mb-3">Post not found</h1>
        <Link
          to="/blog"
          className="text-sexyblue hover:text-black font-futura transition-colors"
        >
          ← Back to all posts
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <article className="max-w-3xl mx-auto px-6 pt-32 pb-20 lg:pt-40">

        {/* Back link */}
        <Link
          to="/blog"
          className="inline-block mb-8 text-gray-400 hover:text-black font-futura text-sm transition-colors"
        >
          ← All writing
        </Link>

        {/* Series breadcrumb */}
        {post.series && (
          <div className="mb-4 text-sm font-futura text-gray-500">
            <span className="text-gray-400 uppercase tracking-wider text-[10px] mr-2">
              Series
            </span>
            <span className="text-black font-bold">{post.series.title}</span>
            {post.series_position && (
              <span className="text-gray-400 ml-2">— Part {post.series_position}</span>
            )}
          </div>
        )}

        {/* Title */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-6xl font-domine font-bold text-black leading-[1.1] tracking-tight mb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {post.title}
        </motion.h1>

        {post.subtitle && (
          <p className="text-xl sm:text-2xl text-gray-500 font-fransisco leading-snug mb-8">
            {post.subtitle}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-gray-500 font-futura flex-wrap mb-10 pb-10 border-b border-gray-100">
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          <span>·</span>
          <span>{post.reading_minutes ?? 1} min read</span>
          {post.tags.length > 0 && (
            <>
              <span>·</span>
              <div className="flex gap-2">
                {post.tags.map((t) => (
                  <Link
                    key={t}
                    to={`/blog?tag=${encodeURIComponent(t)}`}
                    className="hover:text-black transition-colors"
                  >
                    #{t}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Cover image */}
        {post.cover_url && (
          <div className="mb-12 -mx-6 sm:mx-0">
            <img
              src={post.cover_url}
              alt={post.title}
              className="w-full sm:rounded-lg"
            />
          </div>
        )}

        {/* Body */}
        <div className="blog-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
          >
            {post.body}
          </ReactMarkdown>
        </div>

        {/* Series nav */}
        {post.series && seriesPosts.length > 1 && (
          <div className="mt-16 pt-10 border-t border-gray-100">
            <p className="text-gray-400 font-futura text-xs uppercase tracking-[0.2em] mb-4">
              All posts in {post.series.title}
            </p>
            <ol className="space-y-2">
              {seriesPosts.map((p) => (
                <li key={p.id}>
                  {p.id === post.id ? (
                    <span className="font-fransisco text-black">
                      <span className="text-gray-400 mr-2 tabular-nums">
                        {p.series_position ?? "·"}.
                      </span>
                      <strong>{p.title}</strong>
                      <span className="text-gray-400 ml-2 text-xs">(this post)</span>
                    </span>
                  ) : (
                    <Link
                      to={`/blog/${p.slug}`}
                      className="font-fransisco text-gray-700 hover:text-black transition-colors"
                    >
                      <span className="text-gray-400 mr-2 tabular-nums">
                        {p.series_position ?? "·"}.
                      </span>
                      {p.title}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </article>
    </div>
  );
}
