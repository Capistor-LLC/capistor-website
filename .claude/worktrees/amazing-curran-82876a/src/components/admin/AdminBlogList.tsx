import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase, DbBlogPost } from "../../lib/supabase";
import { formatDate } from "../../lib/blog";
import AdminLayout from "./AdminLayout";

export default function AdminBlogList() {
  const [posts, setPosts] = useState<DbBlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      setError(error.message);
      setPosts([]);
      return;
    }
    setPosts(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }
    load();
  };

  const onTogglePublish = async (post: DbBlogPost) => {
    const next = !post.is_published;
    const update: Partial<DbBlogPost> = { is_published: next };
    if (next && !post.published_at) {
      (update as { published_at: string }).published_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from("blog_posts")
      .update(update)
      .eq("id", post.id);
    if (error) {
      alert("Update failed: " + error.message);
      return;
    }
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-sexyblue/35 font-futura text-xs uppercase tracking-[0.2em] mb-2">
            Writing
          </p>
          <h1 className="text-3xl font-futura font-bold text-black">Blog posts</h1>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/series"
            className="px-4 py-2 rounded-lg border border-capistor-300/40 text-sexyblue/70 hover:text-sexyblue hover:border-sexyblue/40 font-futura text-sm transition-colors"
          >
            Manage series
          </Link>
          <Link
            to="/admin/blog/new"
            className="px-4 py-2 rounded-lg bg-sexyblue text-kindofwhite font-futura text-sm hover:bg-capistor-600 transition-colors"
          >
            + New post
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-fransisco text-sm">
          {error}
        </div>
      )}

      {posts === null ? (
        <p className="text-sexyblue/50 font-fransisco">Loading…</p>
      ) : posts.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-dashed border-capistor-300/50 bg-white">
          <p className="text-sexyblue/55 font-fransisco mb-4">No posts yet.</p>
          <Link
            to="/admin/blog/new"
            className="inline-block px-4 py-2 rounded-lg bg-sexyblue text-kindofwhite font-futura text-sm"
          >
            Write your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="flex items-center gap-5 p-4 rounded-2xl border border-capistor-200/70 bg-white hover:border-sexyblue/30 transition-colors"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-capistor-50 flex-shrink-0 flex items-center justify-center">
                {post.cover_url ? (
                  <img
                    src={post.cover_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sexyblue/30 font-futura text-xs">No cover</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-futura font-bold text-black truncate">{post.title}</h3>
                  {!post.is_published && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-futura uppercase tracking-wide">
                      Draft
                    </span>
                  )}
                  {post.is_featured && (
                    <span className="px-2 py-0.5 rounded-full bg-sexyblue/10 text-sexyblue text-[10px] font-futura uppercase tracking-wide">
                      Featured
                    </span>
                  )}
                  {post.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full bg-capistor-100 text-sexyblue/70 text-[10px] font-futura"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-sexyblue/55 font-fransisco text-sm truncate">
                  {post.subtitle || post.excerpt || (
                    <em className="text-sexyblue/30">No subtitle</em>
                  )}
                </p>
                <p className="text-sexyblue/35 font-futura text-xs mt-1">
                  /{post.slug} · updated {formatDate(post.updated_at)}
                  {post.published_at && ` · published ${formatDate(post.published_at)}`}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onTogglePublish(post)}
                  className="px-3 py-1.5 rounded-md border border-capistor-300/40 text-sexyblue/70 hover:text-sexyblue hover:border-sexyblue/40 font-futura text-xs transition-colors"
                >
                  {post.is_published ? "Unpublish" : "Publish"}
                </button>
                <Link
                  to={`/admin/blog/${post.id}/edit`}
                  className="px-3 py-1.5 rounded-md bg-sexyblue text-kindofwhite font-futura text-xs hover:bg-capistor-600 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => onDelete(post.id, post.title)}
                  className="px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 font-futura text-xs transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
