import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, DbBlogSeries } from "../../lib/supabase";
import { slugify } from "../../lib/blog";
import AdminLayout from "./AdminLayout";

export default function AdminSeries() {
  const [list, setList] = useState<DbBlogSeries[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<DbBlogSeries | null>(null);
  const [draft, setDraft] = useState({ title: "", slug: "", description: "" });

  const load = async () => {
    setError(null);
    const { data, error } = await supabase
      .from("blog_series")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setList([]);
      return;
    }
    setList(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (s: DbBlogSeries) => {
    setEditing(s);
    setDraft({ title: s.title, slug: s.slug, description: s.description ?? "" });
  };

  const startNew = () => {
    setEditing({ id: "", slug: "", title: "", description: "", created_at: "" });
    setDraft({ title: "", slug: "", description: "" });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      slug: draft.slug || slugify(draft.title),
      title: draft.title,
      description: draft.description || null,
    };

    const { error } =
      editing && editing.id
        ? await supabase.from("blog_series").update(payload).eq("id", editing.id)
        : await supabase.from("blog_series").insert(payload);

    if (error) {
      setError(error.message);
      return;
    }
    setEditing(null);
    load();
  };

  const onDelete = async (id: string, title: string) => {
    if (!confirm(`Delete series "${title}"? Posts in it will become standalone.`)) return;
    const { error } = await supabase.from("blog_series").delete().eq("id", id);
    if (error) {
      alert("Delete failed: " + error.message);
      return;
    }
    load();
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <Link
            to="/admin/blog"
            className="text-sexyblue/40 hover:text-sexyblue font-futura text-sm transition-colors"
          >
            ← Blog posts
          </Link>
          <h1 className="text-3xl font-futura font-bold text-black mt-1">Series</h1>
        </div>
        {!editing && (
          <button
            onClick={startNew}
            className="px-4 py-2 rounded-lg bg-sexyblue text-kindofwhite font-futura text-sm hover:bg-capistor-600 transition-colors"
          >
            + New series
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-fransisco text-sm">
          {error}
        </div>
      )}

      {editing && (
        <form
          onSubmit={onSubmit}
          className="mb-8 p-5 rounded-2xl border border-capistor-200/70 bg-white space-y-4"
        >
          <h2 className="font-futura font-bold text-black">
            {editing.id ? "Edit series" : "New series"}
          </h2>
          <input
            value={draft.title}
            onChange={(e) => {
              const t = e.target.value;
              setDraft((d) => ({
                ...d,
                title: t,
                slug: editing.id ? d.slug : slugify(t),
              }));
            }}
            placeholder="Series title"
            required
            className="w-full px-3 py-2 rounded-lg border border-capistor-300/40 bg-kindofwhite text-black font-fransisco text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue"
          />
          <input
            value={draft.slug}
            onChange={(e) =>
              setDraft((d) => ({ ...d, slug: slugify(e.target.value) }))
            }
            placeholder="series-slug"
            className="w-full px-3 py-2 rounded-lg border border-capistor-300/40 bg-kindofwhite text-black font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue"
          />
          <textarea
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder="Optional description"
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-capistor-300/40 bg-kindofwhite text-black font-fransisco text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue resize-y"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-sexyblue text-kindofwhite font-futura font-bold text-sm hover:bg-capistor-600 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-5 py-2 rounded-lg border border-capistor-300/40 text-sexyblue/70 hover:text-sexyblue font-futura text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {list === null ? (
        <p className="text-sexyblue/50 font-fransisco">Loading…</p>
      ) : list.length === 0 ? (
        <div className="p-10 text-center rounded-2xl border border-dashed border-capistor-300/50 bg-white">
          <p className="text-sexyblue/55 font-fransisco">
            No series yet. Create one to group related posts.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-capistor-200/70 bg-white"
            >
              <div className="flex-1 min-w-0">
                <p className="font-futura font-bold text-black">{s.title}</p>
                <p className="text-sexyblue/55 font-fransisco text-sm truncate">
                  {s.description || <em className="text-sexyblue/30">No description</em>}
                </p>
                <p className="text-sexyblue/35 font-futura text-xs mt-1">/{s.slug}</p>
              </div>
              <button
                onClick={() => startEdit(s)}
                className="px-3 py-1.5 rounded-md border border-capistor-300/40 text-sexyblue/70 hover:text-sexyblue font-futura text-xs transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(s.id, s.title)}
                className="px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 font-futura text-xs transition-colors"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
