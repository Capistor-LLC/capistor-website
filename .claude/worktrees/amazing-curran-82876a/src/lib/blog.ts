/**
 * Lightweight helpers for blog posts: derive excerpt + reading time from body.
 */

export function deriveReadingMinutes(body: string): number {
  const words = body
    .replace(/```[\s\S]*?```/g, " ") // strip code blocks
    .replace(/[#>*_`~\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function deriveExcerpt(body: string, maxLen = 200): string {
  const stripped = body
    .replace(/^---[\s\S]*?---/, "") // frontmatter
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → text
    .replace(/[#>*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped.length <= maxLen) return stripped;
  return stripped.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
