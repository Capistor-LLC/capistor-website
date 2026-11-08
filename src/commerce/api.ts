import { supabase } from "../lib/supabase";
export async function api<T>(
  action: string,
  body?: unknown,
  query: Record<string, string> = {},
): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(
    `/api/commerce?${new URLSearchParams({ action, ...query })}`,
    {
      method: body === undefined ? "GET" : "POST",
      headers: {
        ...(data.session
          ? { Authorization: `Bearer ${data.session.access_token}` }
          : {}),
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  );
  const payload = await res
    .json()
    .catch(() => ({ error: "The service is temporarily unavailable." }));
  if (!res.ok)
    throw new Error(payload.error || "The request could not be completed.");
  return payload as T;
}
export async function exportRecord(
  id: string,
  format: "json" | "csv",
  reference: string,
) {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(
    `/api/commerce?action=export&id=${encodeURIComponent(id)}&format=${format}`,
    { headers: { Authorization: `Bearer ${data.session?.access_token}` } },
  );
  if (!res.ok)
    throw new Error("Could not export this record. Please try again.");
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = `${reference}.${format}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function uploadFile(
  file: File,
  destination: { order_id?: string; item_id?: string },
  version: string,
) {
  if (file.size > 25 * 1024 * 1024)
    throw new Error("Maximum file size is 25 MB.");
  const buffer = await file.arrayBuffer();
  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", buffer)),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const request = await api<{ id: string; url: string }>("upload", {
    ...destination,
    filename: file.name,
    size_bytes: file.size,
    sha256: hash,
    version_label: version,
  });
  const put = await fetch(request.url, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream" },
    body: file,
  });
  if (!put.ok)
    throw new Error("The upload did not complete. Please try again.");
  await api("finish-upload", { file_id: request.id });
}
