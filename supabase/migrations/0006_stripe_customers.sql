-- Server-owned mapping: email addresses and browser-supplied Stripe IDs are
-- never used as authorization. Separate identities for live and sandbox.
create table if not exists public.stripe_customers (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 mode text not null check (mode in ('test','live')),
 customer_id text,
 created_at timestamptz not null default now(),
 unique(user_id,mode),
 unique(customer_id,mode)
);
alter table public.stripe_customers enable row level security;
revoke all on public.stripe_customers from anon, authenticated;
grant all on public.stripe_customers to service_role;
