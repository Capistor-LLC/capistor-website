# Admin & Backend Setup

## ✅ Already done

- Supabase project **`capistor`** (eu-west-2, ref: `mqzxzvesyjfftddquxik`) — [dashboard](https://supabase.com/dashboard/project/mqzxzvesyjfftddquxik)
- Migrations applied: products, blog posts, series, subscribers, RLS, storage buckets
- Existing 2 products seeded
- `.env.local` written with the project URL + anon key (gitignored)

## ⚠️ Manual steps you still need to do

### 1. Configure Supabase email auth (~ 1 min)
[URL configuration →](https://supabase.com/dashboard/project/mqzxzvesyjfftddquxik/auth/url-configuration)

- **Site URL**: `https://capistor.com`
- **Redirect URLs**: add both `http://localhost:5173/admin` and `https://capistor.com/admin`

[Email provider →](https://supabase.com/dashboard/project/mqzxzvesyjfftddquxik/auth/providers): Enable Email; turn OFF "Confirm email" (magic links don't need it).

### 2. Vercel env vars (~ 1 min)
Add to **Production** + **Preview** in Vercel → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://mqzxzvesyjfftddquxik.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xenh6dmVzeWpmZnRkZHF1eGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODIyMjYsImV4cCI6MjA5NDI1ODIyNn0.Xxguxz2JVALIz0xH5R8Pfz1b4JTJj6x3B-0fJLNINSE
VITE_ADMIN_EMAIL=shoaib@capistor.com
```

---

### 3. (Optional but recommended) Resend email-on-publish

Required only if you want the "Send to subscribers" button to work. Until you do this, the button still renders but errors when clicked.

**a. Sign up for Resend** → https://resend.com (free tier: 100/day, 3000/mo)

**b. Verify a sending domain** in Resend dashboard. Easiest: verify `capistor.com` (you'll add a DNS TXT + DKIM record). For testing only, you can also send from `onboarding@resend.dev` without DNS.

**c. Generate an API key** → https://resend.com/api-keys

**d. Install Supabase CLI** (one-time):
```bash
npm install -g supabase
```

**e. Login + link the project:**
```bash
cd capistor
supabase login                    # opens browser
supabase link --project-ref mqzxzvesyjfftddquxik
```

**f. Set the secrets:**
```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set ADMIN_EMAIL=shoaib@capistor.com
supabase secrets set SITE_URL=https://capistor.com
supabase secrets set FROM_EMAIL="Capistor <hello@capistor.com>"
```

**g. Deploy the edge function:**
```bash
supabase functions deploy send-blog-email
```

That's it. Now publishing a post in admin and clicking "Send to subscribers" will email everyone in your `subscribers` table.

---

## Test locally

- http://localhost:5173/products — Armani-style gallery
- http://localhost:5173/blog — Medium-style blog index
- http://localhost:5173/admin/login — magic-link sign-in

After signing in:
- /admin — dashboard with counts
- /admin/products — products CRUD
- /admin/blog — blog CRUD with markdown editor (split view), tags, series, featured flag
- /admin/series — manage series
- /admin/subscribers — mailing list with CSV export

## Routes

| Path | Access | Purpose |
|---|---|---|
| `/products` | Public | Armani-style gallery of all published products |
| `/blog` | Public | Medium-style index with tag filtering |
| `/blog/:slug` | Public | Post reader with code highlighting + KaTeX math |
| `/admin/login` | Public | Magic-link sign-in |
| `/admin` | Admin | Dashboard |
| `/admin/products[/...]` | Admin | Product CRUD |
| `/admin/blog[/...]` | Admin | Blog CRUD |
| `/admin/series` | Admin | Series CRUD |
| `/admin/subscribers` | Admin | Mailing list |

## Markdown features in the blog editor

- **Split view**: type markdown on the left, see live preview on the right
- **Code blocks**: ```` ```ts ```` etc. — syntax highlighted via highlight.js (GitHub theme)
- **Math**:
  - Inline: `$E = mc^2$`
  - Block: `$$\int_0^\infty e^{-x^2}dx = \frac{\sqrt{\pi}}{2}$$`
- **GitHub-flavored markdown**: tables, task lists, strikethrough, autolinks
- **Images**: upload via the Cover Image button on the side panel; for inline images, upload to your Supabase Storage `blog-images` bucket and paste the public URL

## What's left to build (Phase 3 ideas)

- Drag-and-drop image reordering in the product editor
- Inline image upload from the blog editor (drag-into-textarea, auto-insert URL)
- RSS feed at `/blog/rss.xml`
- Reading progress bar at top of blog posts
- "Share on Twitter/LinkedIn" buttons on posts
