// Supabase Edge Function: send-blog-email
//
// Sends a published blog post to all confirmed subscribers via Resend.
// Verifies the caller is the admin (matches VITE_ADMIN_EMAIL / ADMIN_EMAIL secret).
//
// Deploy:
//   supabase functions deploy send-blog-email --project-ref mqzxzvesyjfftddquxik
//
// Required Supabase secrets (set via dashboard or CLI):
//   RESEND_API_KEY  — from https://resend.com/api-keys
//   ADMIN_EMAIL     — shoaib@capistor.com (the whitelisted admin)
//   SITE_URL        — https://capistor.com (used in email links)
//   FROM_EMAIL      — e.g. "Capistor <hello@capistor.com>" (must be a verified Resend domain)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = (Deno.env.get("ADMIN_EMAIL") ?? "").toLowerCase();
    const SITE_URL = Deno.env.get("SITE_URL") ?? "https://capistor.com";
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "Capistor <hello@capistor.com>";

    if (!RESEND_API_KEY) {
      return json({ error: "RESEND_API_KEY not set in Supabase secrets" }, 500);
    }

    // ── Verify caller is admin ──
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Missing auth token" }, 401);

    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: userResp, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !userResp.user) return json({ error: "Invalid session" }, 401);
    const callerEmail = (userResp.user.email ?? "").toLowerCase();
    if (callerEmail !== ADMIN_EMAIL) return json({ error: "Not authorized" }, 403);

    // ── Body ──
    const { post_id } = await req.json();
    if (!post_id) return json({ error: "post_id is required" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: post, error: postErr } = await admin
      .from("blog_posts")
      .select("*")
      .eq("id", post_id)
      .single();
    if (postErr || !post) return json({ error: "Post not found" }, 404);
    if (!post.is_published) return json({ error: "Post is not published" }, 400);

    const { data: subs, error: subsErr } = await admin
      .from("subscribers")
      .select("email")
      .eq("confirmed", true);
    if (subsErr) return json({ error: subsErr.message }, 500);
    if (!subs || subs.length === 0) {
      return json({ error: "No subscribers" }, 400);
    }

    const emails = subs.map((s) => s.email);
    const postUrl = `${SITE_URL}/blog/${post.slug}`;

    const html = renderEmail({
      title: post.title,
      subtitle: post.subtitle,
      excerpt: post.excerpt ?? "",
      coverUrl: post.cover_url,
      postUrl,
      readingMinutes: post.reading_minutes ?? 1,
    });

    const text = `${post.title}\n\n${post.subtitle ?? ""}\n\n${post.excerpt ?? ""}\n\nRead it: ${postUrl}`;

    // ── Send via Resend (uses BCC for batch) ──
    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: FROM_EMAIL,
        bcc: emails,
        subject: post.title,
        html,
        text,
      }),
    });

    if (!resendResp.ok) {
      const errBody = await resendResp.text();
      return json({ error: `Resend: ${errBody}` }, 502);
    }

    await admin
      .from("blog_posts")
      .update({ email_sent_at: new Date().toISOString() })
      .eq("id", post.id);

    return json({ ok: true, recipients: emails.length });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function renderEmail(p: {
  title: string;
  subtitle: string | null;
  excerpt: string;
  coverUrl: string | null;
  postUrl: string;
  readingMinutes: number;
}): string {
  const cover = p.coverUrl
    ? `<img src="${p.coverUrl}" alt="" style="width:100%;border-radius:8px;margin:0 0 24px 0;" />`
    : "";
  const subtitle = p.subtitle
    ? `<p style="font-family:Georgia,serif;font-size:18px;color:#666;margin:0 0 16px 0;line-height:1.4;">${escape(p.subtitle)}</p>`
    : "";

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;color:#222;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:92%;">
        <tr><td style="padding:32px 40px 12px;">
          <p style="font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999;margin:0 0 12px;">Capistor — Writing</p>
          <h1 style="font-family:Georgia,serif;font-size:32px;line-height:1.2;color:#111;margin:0 0 12px;">${escape(p.title)}</h1>
          ${subtitle}
          <p style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#999;margin:0 0 24px;">${p.readingMinutes} min read</p>
          ${cover}
          <p style="font-size:16px;line-height:1.6;color:#333;margin:0 0 28px;">${escape(p.excerpt)}</p>
          <a href="${p.postUrl}" style="display:inline-block;background:#343A40;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:bold;">Read the full post →</a>
        </td></tr>
        <tr><td style="padding:24px 40px 32px;border-top:1px solid #eee;">
          <p style="font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#999;margin:0;line-height:1.6;">
            You're receiving this because you subscribed at <a href="${escape((Deno.env.get("SITE_URL") ?? "https://capistor.com"))}" style="color:#666;">capistor.com</a>.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
