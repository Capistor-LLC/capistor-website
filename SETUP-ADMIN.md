# Admin & Backend Setup

## ✅ Done automatically

- Supabase project **`capistor`** created (region eu-west-2)
  - Project ref: `mqzxzvesyjfftddquxik`
  - URL: `https://mqzxzvesyjfftddquxik.supabase.co`
  - Dashboard: https://supabase.com/dashboard/project/mqzxzvesyjfftddquxik
- Migration applied: `products`, `product_images`, `subscribers` tables, RLS policies, `product-images` storage bucket, admin email check function `is_admin()`
- Existing 2 products seeded (Smart Watch, Industrial Board)
- `.env.local` written with real URL + anon key (and gitignored)
- Dev server restarted on http://localhost:5173 — already pulling products from Supabase

## ⚠️ Two manual steps left

### 1. Configure Supabase email auth (~ 1 minute)

Open **Authentication → URL Configuration** in your Supabase dashboard:
https://supabase.com/dashboard/project/mqzxzvesyjfftddquxik/auth/url-configuration

- **Site URL**: `https://capistor.com` (your production domain)
- **Redirect URLs** — add both:
  - `http://localhost:5173/admin`
  - `https://capistor.com/admin`

Then **Authentication → Providers → Email**:
https://supabase.com/dashboard/project/mqzxzvesyjfftddquxik/auth/providers

- "Enable Email provider" should be ON (it's the default)
- "Confirm email" — turn OFF (not needed for magic links)

### 2. Add the same 3 env vars to Vercel (~ 1 minute)

In Vercel → your `capistor-website` project → **Settings → Environment Variables**, add for both **Production** and **Preview**:

```
VITE_SUPABASE_URL=https://mqzxzvesyjfftddquxik.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xenh6dmVzeWpmZnRkZHF1eGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODIyMjYsImV4cCI6MjA5NDI1ODIyNn0.Xxguxz2JVALIz0xH5R8Pfz1b4JTJj6x3B-0fJLNINSE
VITE_ADMIN_EMAIL=shoaib@capistor.com
```

Then redeploy (Vercel will trigger automatically when you push, or click "Redeploy" on the latest deployment).

## Test it locally

1. Open http://localhost:5173 — homepage Projects section + Footer subscribe should now talk to Supabase
2. Open http://localhost:5173/products — Armani-style gallery of the 2 seeded products
3. Open http://localhost:5173/admin/login — enter `shoaib@capistor.com`, click the magic link in your email, you're in

## Routes added

| Path | Access | Purpose |
|---|---|---|
| `/products` | Public | Armani-style gallery of all published products |
| `/admin/login` | Public | Magic-link sign-in (whitelisted email only) |
| `/admin` | Admin | Dashboard with counts + quick actions |
| `/admin/products` | Admin | List, publish/unpublish, edit, delete |
| `/admin/products/new` | Admin | Create new product |
| `/admin/products/:id/edit` | Admin | Edit existing product |
| `/admin/subscribers` | Admin | Mailing list view + CSV export |

## What's next (Phase 2 — say the word)

- Medium-style **blog system** (markdown + KaTeX equations)
- **Resend integration** so publishing a blog post auto-emails subscribers
- Drag-and-drop image reordering in the product editor
