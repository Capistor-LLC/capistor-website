-- Complete the existing editorial CMS without replacing any existing posts.
begin;
create table if not exists public.blog_series(id uuid primary key default gen_random_uuid(),slug text not null unique,title text not null,description text,created_at timestamptz not null default now());
create table if not exists public.blog_posts(id uuid primary key default gen_random_uuid(),slug text not null unique,title text not null,subtitle text,cover_url text,body text not null default '',excerpt text,reading_minutes integer,tags text[] not null default '{}',is_published boolean not null default false,is_featured boolean not null default false,series_id uuid references public.blog_series(id),series_position integer,email_sent_at timestamptz,published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table public.blog_posts enable row level security;
alter table public.blog_series enable row level security;
-- Remove legacy policies so an older email-only admin policy cannot bypass MFA.
do $$ declare p record; begin for p in select tablename,policyname from pg_policies where schemaname='public' and tablename in ('blog_posts','blog_series') loop execute format('drop policy %I on public.%I',p.policyname,p.tablename);end loop;end $$;
grant select on public.blog_posts,public.blog_series to anon,authenticated;
grant insert,update,delete on public.blog_posts,public.blog_series to authenticated;
create policy blog_public_read on public.blog_posts for select using(is_published or public.is_admin());
create policy series_public_read on public.blog_series for select using(true);
create policy blog_admin_write on public.blog_posts for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy series_admin_write on public.blog_series for all to authenticated using(public.is_admin()) with check(public.is_admin());
-- Public editorial images are separate from confidential R2 project files.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('blog-images','blog-images',true,8388608,array['image/jpeg','image/png','image/webp','image/gif']) on conflict(id) do update set file_size_limit=8388608,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "blog-images public read" on storage.objects;
drop policy if exists "blog-images admin manage" on storage.objects;
create policy "blog-images public read" on storage.objects for select using(bucket_id='blog-images');
create policy "blog-images admin manage" on storage.objects for all to authenticated using(bucket_id='blog-images' and public.is_admin()) with check(bucket_id='blog-images' and public.is_admin());
-- New projects can disable default API grants. Give the existing portfolio CMS
-- only the permissions its RLS policies permit; confidential commerce is separate.
grant select on public.products,public.product_images to anon,authenticated;
grant insert,update,delete on public.products,public.product_images to authenticated;
grant insert on public.subscribers to anon,authenticated;
grant select,update,delete on public.subscribers to authenticated;
grant all on public.products,public.product_images,public.subscribers,public.blog_posts,public.blog_series to service_role;
update storage.buckets set file_size_limit=8388608,allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'] where id='product-images';
commit;
