-- =============================================================
-- Capistor — initial schema
-- Run this in your Supabase SQL editor (or via `supabase db push`).
-- Idempotent: safe to run multiple times.
-- =============================================================

-- ── Extensions ──
create extension if not exists "pgcrypto";

-- ── Tables ──

create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  tagline      text not null default '',
  description  text,
  position     int  not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_position_idx on public.products(position);
create index if not exists products_published_idx on public.products(is_published);

create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text not null default '',
  caption     text,
  position    int  not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images(product_id);

create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  source     text,
  confirmed  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Auto-update `updated_at` ──
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── RLS ──
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.subscribers    enable row level security;

-- Helper: is the current user the admin?
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce(
    (auth.jwt() ->> 'email') ilike 'shoaib@capistor.com',
    false
  );
$$;

-- Products: anyone can read published; admin can do anything
drop policy if exists products_public_read    on public.products;
drop policy if exists products_admin_all      on public.products;

create policy products_public_read on public.products
  for select using (is_published = true);

create policy products_admin_all on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- Product images: anyone can read those tied to published products; admin can do anything
drop policy if exists product_images_public_read on public.product_images;
drop policy if exists product_images_admin_all   on public.product_images;

create policy product_images_public_read on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id and p.is_published = true
    )
  );

create policy product_images_admin_all on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

-- Subscribers: anyone can insert (anonymous subscribe), only admin can read/delete
drop policy if exists subscribers_anon_insert on public.subscribers;
drop policy if exists subscribers_admin_read  on public.subscribers;
drop policy if exists subscribers_admin_all   on public.subscribers;

create policy subscribers_anon_insert on public.subscribers
  for insert with check (true);

create policy subscribers_admin_all on public.subscribers
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Storage bucket for product images ──
insert into storage.buckets (id, name, public)
  values ('product-images', 'product-images', true)
  on conflict (id) do update set public = true;

-- Storage policies: public read, admin write
drop policy if exists "product-images public read"  on storage.objects;
drop policy if exists "product-images admin write"  on storage.objects;
drop policy if exists "product-images admin update" on storage.objects;
drop policy if exists "product-images admin delete" on storage.objects;

create policy "product-images public read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product-images admin write"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "product-images admin update"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());

create policy "product-images admin delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- ── Seed: existing products ──
-- (Idempotent via slug uniqueness)
insert into public.products (slug, name, tagline, position) values
  ('smart-watch',     'Smart Watch',
   'ESP32-powered wearable with health monitoring, OLED display, and Bluetooth connectivity.', 0),
  ('industrial-board','Industrial Board',
   'CE-compliant industrial PCB with EMI shielding built for harsh-environment automation.',   1)
on conflict (slug) do nothing;

insert into public.product_images (product_id, url, alt, caption, position)
select p.id, '/product_images/smartWatch.jpg', 'Smart Watch',
       'Wearable tech companion', 0
from public.products p where p.slug = 'smart-watch'
  and not exists (select 1 from public.product_images pi where pi.product_id = p.id);

insert into public.product_images (product_id, url, alt, caption, position)
select p.id, '/product_images/IndustrialioT.png', 'Industrial Control Board',
       'Reliable power and signal backbone', 0
from public.products p where p.slug = 'industrial-board'
  and not exists (select 1 from public.product_images pi where pi.product_id = p.id);
