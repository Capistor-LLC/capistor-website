import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase, DbProductImage } from "../../lib/supabase";
import AdminLayout from "./AdminLayout";

type Mode = "new" | "edit";

interface ImageDraft {
  id?: string; // existing image id (if persisted)
  url: string;
  alt: string;
  caption: string;
  position: number;
  // For local-only uploads before save:
  pendingFile?: File;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminProductEditor({ mode }: { mode: Mode }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [position, setPosition] = useState(0);
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugTouched = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-derive slug from name (until user manually edits slug)
  useEffect(() => {
    if (!slugTouched.current) setSlug(slugify(name));
  }, [name]);

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, images:product_images(*)")
        .eq("id", id)
        .single();
      if (error || !data) {
        setError(error?.message ?? "Product not found");
        setLoading(false);
        return;
      }
      setName(data.name);
      setSlug(data.slug);
      slugTouched.current = true;
      setTagline(data.tagline);
      setDescription(data.description ?? "");
      setIsPublished(data.is_published);
      setPosition(data.position);
      const sorted = [...(data.images as DbProductImage[])].sort(
        (a, b) => a.position - b.position
      );
      setImages(
        sorted.map((img) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          caption: img.caption ?? "",
          position: img.position,
        }))
      );
      setLoading(false);
    })();
  }, [mode, id]);

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const startPos = images.length;
    const newDrafts: ImageDraft[] = files.map((file, i) => ({
      url: URL.createObjectURL(file),
      alt: name || file.name.replace(/\.[^.]+$/, ""),
      caption: "",
      position: startPos + i,
      pendingFile: file,
    }));
    setImages((prev) => [...prev, ...newDrafts]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    const next = [...images];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setImages(next.map((img, i) => ({ ...img, position: i })));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx).map((img, i) => ({ ...img, position: i })));
  };

  const updateImage = (idx: number, patch: Partial<ImageDraft>) => {
    setImages((prev) => prev.map((img, i) => (i === idx ? { ...img, ...patch } : img)));
  };

  const onSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }

    setSaving(true);
    try {
      // 1. Upload pending image files to storage
      const uploadedUrls = new Map<File, string>();
      for (const img of images) {
        if (!img.pendingFile) continue;
        const file = img.pendingFile;
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${slug || "product"}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw new Error(`Image upload failed: ${upErr.message}`);
        const { data: pub } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        uploadedUrls.set(file, pub.publicUrl);
      }

      // 2. Upsert product row
      let productId = id;
      if (mode === "new") {
        const { data, error: insErr } = await supabase
          .from("products")
          .insert({
            slug,
            name,
            tagline,
            description: description || null,
            position,
            is_published: isPublished,
          })
          .select("id")
          .single();
        if (insErr) throw new Error(insErr.message);
        productId = data.id;
      } else {
        const { error: upErr } = await supabase
          .from("products")
          .update({
            slug,
            name,
            tagline,
            description: description || null,
            position,
            is_published: isPublished,
          })
          .eq("id", productId!);
        if (upErr) throw new Error(upErr.message);
      }

      // 3. Sync images: delete removed, update existing, insert new
      if (mode === "edit") {
        const keepIds = images.filter((i) => i.id).map((i) => i.id!);
        const { data: existing } = await supabase
          .from("product_images")
          .select("id")
          .eq("product_id", productId!);
        const toDelete = (existing ?? [])
          .map((r) => r.id)
          .filter((eid) => !keepIds.includes(eid));
        if (toDelete.length > 0) {
          const { error: delErr } = await supabase
            .from("product_images")
            .delete()
            .in("id", toDelete);
          if (delErr) throw new Error(delErr.message);
        }
      }

      for (const img of images) {
        const resolvedUrl = img.pendingFile
          ? uploadedUrls.get(img.pendingFile)!
          : img.url;
        if (img.id) {
          const { error: upErr } = await supabase
            .from("product_images")
            .update({
              url: resolvedUrl,
              alt: img.alt,
              caption: img.caption || null,
              position: img.position,
            })
            .eq("id", img.id);
          if (upErr) throw new Error(upErr.message);
        } else {
          const { error: insErr } = await supabase.from("product_images").insert({
            product_id: productId!,
            url: resolvedUrl,
            alt: img.alt,
            caption: img.caption || null,
            position: img.position,
          });
          if (insErr) throw new Error(insErr.message);
        }
      }

      navigate("/admin/products", { replace: true });
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setSaving(false);
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
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <Link
            to="/admin/products"
            className="text-sexyblue/40 hover:text-sexyblue font-futura text-sm transition-colors"
          >
            ← All products
          </Link>
          <h1 className="text-3xl font-futura font-bold text-black mt-1">
            {mode === "new" ? "New product" : "Edit product"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-futura text-sexyblue/70 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 accent-sexyblue"
            />
            Published
          </label>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-sexyblue text-kindofwhite font-futura font-bold text-sm hover:bg-capistor-600 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 font-fransisco text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: text fields ── */}
        <div className="lg:col-span-1 space-y-5">
          <div className="p-5 rounded-2xl border border-capistor-200/70 bg-white space-y-4">
            <div>
              <label className="block text-black font-futura font-semibold text-sm mb-1.5">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Smart Watch"
                className="w-full px-3 py-2 rounded-lg border border-capistor-300/40 bg-kindofwhite text-black font-fransisco text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue"
              />
            </div>

            <div>
              <label className="block text-black font-futura font-semibold text-sm mb-1.5">
                Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  slugTouched.current = true;
                  setSlug(slugify(e.target.value));
                }}
                placeholder="smart-watch"
                className="w-full px-3 py-2 rounded-lg border border-capistor-300/40 bg-kindofwhite text-black font-fransisco text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sexyblue"
              />
              <p className="text-sexyblue/35 font-fransisco text-xs mt-1">
                URL: /products/{slug || "..."}
              </p>
            </div>

            <div>
              <label className="block text-black font-futura font-semibold text-sm mb-1.5">
                Tagline
              </label>
              <textarea
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="One-line summary shown on cards and gallery."
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-capistor-300/40 bg-kindofwhite text-black font-fransisco text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue resize-none"
              />
            </div>

            <div>
              <label className="block text-black font-futura font-semibold text-sm mb-1.5">
                Long description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full product description for the detail page."
                rows={6}
                className="w-full px-3 py-2 rounded-lg border border-capistor-300/40 bg-kindofwhite text-black font-fransisco text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue resize-y"
              />
            </div>

            <div>
              <label className="block text-black font-futura font-semibold text-sm mb-1.5">
                Position
              </label>
              <input
                type="number"
                value={position}
                onChange={(e) => setPosition(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-capistor-300/40 bg-kindofwhite text-black font-fransisco text-sm focus:outline-none focus:ring-2 focus:ring-sexyblue"
              />
              <p className="text-sexyblue/35 font-fransisco text-xs mt-1">
                Lower = shown first. Use 0, 10, 20… to leave room.
              </p>
            </div>
          </div>
        </div>

        {/* ── Right: images ── */}
        <div className="lg:col-span-2">
          <div className="p-5 rounded-2xl border border-capistor-200/70 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-futura font-bold text-black">Images</h2>
                <p className="text-sexyblue/45 font-fransisco text-xs">
                  Drag-and-drop coming later — for now use the upload button or
                  arrow buttons to reorder.
                </p>
              </div>
              <label className="px-3 py-1.5 rounded-md bg-sexyblue text-kindofwhite font-futura text-xs cursor-pointer hover:bg-capistor-600 transition-colors">
                + Upload
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onFiles}
                  className="hidden"
                />
              </label>
            </div>

            {images.length === 0 ? (
              <div className="p-10 text-center rounded-lg border border-dashed border-capistor-300/50">
                <p className="text-sexyblue/45 font-fransisco text-sm">
                  No images yet. Upload one to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id ?? `pending-${idx}`}
                    className="flex gap-4 p-3 rounded-lg border border-capistor-200/70 bg-kindofwhite"
                  >
                    <div className="w-24 h-24 rounded-md overflow-hidden bg-capistor-50 flex-shrink-0">
                      <img
                        src={img.url}
                        alt={img.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={img.alt}
                        onChange={(e) => updateImage(idx, { alt: e.target.value })}
                        placeholder="Alt text"
                        className="px-2 py-1.5 rounded-md border border-capistor-300/40 bg-white text-black font-fransisco text-sm focus:outline-none focus:ring-1 focus:ring-sexyblue"
                      />
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) =>
                          updateImage(idx, { caption: e.target.value })
                        }
                        placeholder="Caption (optional)"
                        className="px-2 py-1.5 rounded-md border border-capistor-300/40 bg-white text-black font-fransisco text-sm focus:outline-none focus:ring-1 focus:ring-sexyblue"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(idx, -1)}
                        disabled={idx === 0}
                        className="w-8 h-8 rounded-md border border-capistor-300/40 text-sexyblue/70 hover:text-sexyblue disabled:opacity-30 transition-colors"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 1)}
                        disabled={idx === images.length - 1}
                        className="w-8 h-8 rounded-md border border-capistor-300/40 text-sexyblue/70 hover:text-sexyblue disabled:opacity-30 transition-colors"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="w-8 h-8 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
