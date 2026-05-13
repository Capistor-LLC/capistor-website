import { ChangeEvent, ClipboardEvent, DragEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { supabase, DbBlogSeries } from "../../lib/supabase";
import { deriveExcerpt, deriveReadingMinutes, slugify } from "../../lib/blog";
import AdminLayout from "./AdminLayout";

type Mode = "new" | "edit";

export default function AdminBlogEditor({ mode }: { mode: Mode }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const [seriesPosition, setSeriesPosition] = useState<number | null>(null);
  const [emailSentAt, setEmailSentAt] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  const [allSeries, setAllSeries] = useState<DbBlogSeries[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const slugTouched = useRef(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slugTouched.current) setSlug(slugify(title));
  }, [title]);

  // Load series list
  useEffect(() => {
    supabase
      .from("blog_series")
      .select("*")
      .order("title")
      .then(({ data }) => setAllSeries(data ?? []));
  }, []);

  // Load existing post (edit mode)
  useEffect(() => {
    if (mode !== "edit" || !id) return;
    (async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        setError(error?.message ?? "Post not found");
        setLoading(false);
        return;
      }
      setTitle(data.title);
      setSlug(data.slug);
      slugTouched.current = true;
      setSubtitle(data.subtitle ?? "");
      setCoverUrl(data.cover_url);
      setBody(data.body);
      setExcerpt(data.excerpt ?? "");
      setTagsInput((data.tags ?? []).join(", "));
      setIsPublished(data.is_published);
      setIsFeatured(data.is_featured);
      setSeriesId(data.series_id);
      setSeriesPosition(data.series_position);
      setEmailSentAt(data.email_sent_at);
      setPublishedAt(data.published_at);
      setLoading(false);
    })();
  }, [mode, id]);

  const onCoverFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${slug || "post"}/cover-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("blog-images")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upErr) {
      setError(`Cover upload failed: ${upErr.message}`);
      return;
    }
    const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(path);
    setCoverUrl(pub.publicUrl);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  // Upload an inline image to blog-images storage and return its public URL.
  const uploadInlineImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const path = `${slug || "post"}/inline-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("blog-images")
      .upload(path, file, { contentType: file.type });
    if (upErr) {
      setError(`Image upload failed: ${upErr.message}`);
      return null;
    }
    const { data: pub } = supabase.storage.from("blog-images").getPublicUrl(path);
    return pub.publicUrl;
  };

  // Insert markdown image at end of body (or at cursor if we can find it).
  const insertImageMarkdown = (url: string, name = "image") => {
    const md = `\n\n![${name}](${url})\n\n`;
    setBody((prev) => prev + md);
  };

  const onPasteImage = async (e: ClipboardEvent<HTMLDivElement>) => {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItem = items.find((it) => it.type.startsWith("image/"));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    setInfo("Uploading pasted image…");
    const url = await uploadInlineImage(file);
    if (url) {
      insertImageMarkdown(url, "pasted image");
      setInfo("Image inserted.");
      setTimeout(() => setInfo(null), 1500);
    }
  };

  const onDropImages = async (e: DragEvent<HTMLDivElement>) => {
    const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;
    e.preventDefault();
    setInfo(`Uploading ${files.length} image${files.length === 1 ? "" : "s"}…`);
    for (const file of files) {
      const url = await uploadInlineImage(file);
      if (url) insertImageMarkdown(url, file.name.replace(/\.[^.]+$/, ""));
    }
    setInfo("Images inserted.");
    setTimeout(() => setInfo(null), 1500);
  };

  const onSave = async (publishNow = false) => {
    setError(null);
    setInfo(null);
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const computedExcerpt = excerpt.trim() || deriveExcerpt(body);
    const reading = deriveReadingMinutes(body);

    const wasPublished = isPublished;
    const willBePublished = publishNow ? true : isPublished;

    const payload = {
      slug: slug || slugify(title),
      title,
      subtitle: subtitle || null,
      cover_url: coverUrl,
      body,
      excerpt: computedExcerpt,
      reading_minutes: reading,
      tags,
      is_published: willBePublished,
      is_featured: isFeatured,
      series_id: seriesId,
      series_position: seriesPosition,
      published_at:
        willBePublished && !publishedAt ? new Date().toISOString() : publishedAt,
    };

    setSaving(true);
    try {
      if (mode === "new") {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        navigate(`/admin/blog/${data.id}/edit`, { replace: true });
        setInfo("Saved.");
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", id!);
        if (error) throw new Error(error.message);
        if (willBePublished && !wasPublished) {
          setPublishedAt(payload.published_at);
        }
        setIsPublished(willBePublished);
        setInfo("Saved.");
      }
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  const onSendEmail = async () => {
    if (!id) {
      setError("Save the post first before sending.");
      return;
    }
    if (!isPublished) {
      setError("Publish the post before sending.");
      return;
    }
    if (!confirm("Send this post to all subscribers? This can't be undone.")) return;

    setSending(true);
    setError(null);
    setInfo(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const projectUrl = import.meta.env.VITE_SUPABASE_URL;
      const res = await fetch(`${projectUrl}/functions/v1/send-blog-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post_id: id }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const result = await res.json();
      setEmailSentAt(new Date().toISOString());
      setInfo(`Email sent to ${result.recipients ?? "subscribers"}.`);
    } catch (e: any) {
      setError(
        `Send failed: ${e.message}. ` +
          "Make sure the send-blog-email edge function is deployed and RESEND_API_KEY is set in Supabase secrets."
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-sexyblue/50 font-fransisco">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Link
            to="/admin/blog"
            className="text-sexyblue/40 hover:text-sexyblue font-futura text-sm transition-colors"
          >
            ← All posts
          </Link>
          <h1 className="text-3xl font-futura font-bold text-black mt-1">
            {mode === "new" ? "New post" : "Edit post"}
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isPublished && (
            <Link
              to={`/blog/${slug}`}
              target="_blank"
              className="text-sexyblue/50 hover:text-sexyblue font-futura text-sm transition-colors"
            >
              View live →
            </Link>
          )}
          <button
            onClick={() => onSave(false)}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-capistor-300/40 text-sexyblue hover:border-sexyblue/40 font-futura text-sm transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save draft"}
          </button>
          <button
            onClick={() => onSave(true)}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-sexyblue text-kindofwhite font-futura font-bold text-sm hover:bg-capistor-600 transition-colors disabled:opacity-60"
          >
            {isPublished ? "Save & keep published" : "Save & publish"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-fransisco text-sm">
          {error}
        </div>
      )}
      {info && (
        <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 font-fransisco text-sm">
          {info}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Left: meta panel ── */}
        <div className="lg:col-span-1 space-y-5">
          {/* Cover */}
          <div className="p-4 rounded-2xl border border-capistor-200/70 bg-white">
            <p className="font-futura font-bold text-black mb-2 text-sm">Cover image</p>
            {coverUrl ? (
              <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-capistor-50 mb-2">
                <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                <button
                  onClick={() => setCoverUrl(null)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm hover:bg-black"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="aspect-[16/9] rounded-lg border border-dashed border-capistor-300/50 flex items-center justify-center text-sexyblue/30 font-fransisco text-xs mb-2">
                No cover
              </div>
            )}
            <label className="block w-full text-center px-3 py-2 rounded-md bg-sexyblue text-kindofwhite font-futura text-xs cursor-pointer hover:bg-capistor-600 transition-colors">
              {coverUrl ? "Replace" : "Upload"} cover
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={onCoverFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Meta fields */}
          <div className="p-4 rounded-2xl border border-capistor-200/70 bg-white space-y-3">
            <div>
              <label className="block text-black font-futura font-semibold text-xs mb-1">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  setSlug(slugify(e.target.value));
                }}
                className="w-full px-3 py-1.5 rounded-md border border-capistor-300/40 bg-kindofwhite text-black font-mono text-xs focus:outline-none focus:ring-1 focus:ring-sexyblue"
              />
              <p className="text-sexyblue/35 font-fransisco text-[10px] mt-1">
                /blog/{slug || "..."}
              </p>
            </div>

            <div>
              <label className="block text-black font-futura font-semibold text-xs mb-1">
                Tags
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="tutorial, esp32, thoughts"
                className="w-full px-3 py-1.5 rounded-md border border-capistor-300/40 bg-kindofwhite text-black font-fransisco text-xs focus:outline-none focus:ring-1 focus:ring-sexyblue"
              />
              <p className="text-sexyblue/35 font-fransisco text-[10px] mt-1">
                Comma-separated.
              </p>
            </div>

            <div>
              <label className="block text-black font-futura font-semibold text-xs mb-1">
                Series
              </label>
              <select
                value={seriesId ?? ""}
                onChange={(e) => setSeriesId(e.target.value || null)}
                className="w-full px-3 py-1.5 rounded-md border border-capistor-300/40 bg-kindofwhite text-black font-fransisco text-xs focus:outline-none focus:ring-1 focus:ring-sexyblue"
              >
                <option value="">— None —</option>
                {allSeries.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
              {seriesId && (
                <input
                  type="number"
                  value={seriesPosition ?? ""}
                  onChange={(e) =>
                    setSeriesPosition(e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="Position in series"
                  className="mt-2 w-full px-3 py-1.5 rounded-md border border-capistor-300/40 bg-kindofwhite text-black font-fransisco text-xs focus:outline-none focus:ring-1 focus:ring-sexyblue"
                />
              )}
            </div>

            <label className="flex items-center gap-2 text-xs font-futura text-sexyblue/80 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-sexyblue"
              />
              Featured (pin to top)
            </label>

            <label className="flex items-center gap-2 text-xs font-futura text-sexyblue/80 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 accent-sexyblue"
              />
              Published
            </label>

            <div>
              <label className="block text-black font-futura font-semibold text-xs mb-1">
                Custom excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="(auto-derived from body if blank)"
                rows={3}
                className="w-full px-3 py-1.5 rounded-md border border-capistor-300/40 bg-kindofwhite text-black font-fransisco text-xs focus:outline-none focus:ring-1 focus:ring-sexyblue resize-y"
              />
            </div>
          </div>

          {/* Send to subscribers */}
          <div className="p-4 rounded-2xl border border-capistor-200/70 bg-white">
            <p className="font-futura font-bold text-black mb-1 text-sm">
              Email subscribers
            </p>
            {emailSentAt ? (
              <p className="text-sexyblue/55 font-fransisco text-xs mb-2">
                ✓ Sent {new Date(emailSentAt).toLocaleString()}
              </p>
            ) : (
              <p className="text-sexyblue/55 font-fransisco text-xs mb-2">
                Not yet sent.
              </p>
            )}
            <button
              onClick={onSendEmail}
              disabled={sending || !id || !isPublished}
              className="w-full px-3 py-2 rounded-md bg-sexyblue text-kindofwhite font-futura text-xs hover:bg-capistor-600 transition-colors disabled:opacity-60"
            >
              {sending ? "Sending…" : emailSentAt ? "Send again" : "Send to subscribers"}
            </button>
            <p className="text-sexyblue/30 font-fransisco text-[10px] mt-2">
              Requires Resend API key + edge function setup. See SETUP-ADMIN.md.
            </p>
          </div>
        </div>

        {/* ── Right: title + body ── */}
        <div className="lg:col-span-3 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full px-4 py-3 rounded-xl border border-capistor-200/70 bg-white text-2xl font-futura font-bold text-black focus:outline-none focus:ring-2 focus:ring-sexyblue"
          />
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle (optional)"
            className="w-full px-4 py-2.5 rounded-xl border border-capistor-200/70 bg-white text-base font-fransisco text-sexyblue/80 focus:outline-none focus:ring-2 focus:ring-sexyblue"
          />

          <div
            data-color-mode="light"
            className="rounded-xl overflow-hidden border border-capistor-200/70 bg-white"
            onPaste={onPasteImage}
            onDrop={onDropImages}
            onDragOver={(e) => e.preventDefault()}
          >
            <MDEditor
              value={body}
              onChange={(v) => setBody(v ?? "")}
              height={620}
              preview="live"
              visibleDragbar={false}
            />
          </div>

          <p className="text-sexyblue/35 font-fransisco text-xs">
            Markdown · code blocks, $math$, $$blocks$$, tables, links.
            <strong className="text-sexyblue/60"> Drag images into the editor or paste from clipboard</strong> —
            they auto-upload to Supabase Storage and the markdown is inserted at the end of the post.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
