-- VisionaryHaus — portfolio + inquiries schema (applied to the VisionaryHaus Supabase project)
create extension if not exists pgcrypto with schema extensions;

-- Admins: only rows in this table may manage content. No signup flow; see supabase/seed/add_admin.sql.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;
grant execute on function public.is_admin() to anon, authenticated, service_role;

drop policy if exists "admins: read" on public.admins;
create policy "admins: read" on public.admins for select to authenticated using (public.is_admin());

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Categories -> Projects -> Photos
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 80),
  tagline text check (char_length(tagline) <= 200),
  description text check (char_length(description) <= 4000),
  cover_photo_id uuid,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 1 and 120),
  subtitle text check (char_length(subtitle) <= 200),
  description text check (char_length(description) <= 6000),
  client text check (char_length(client) <= 120),
  location text check (char_length(location) <= 120),
  shot_on date,
  cover_photo_id uuid,
  sort_order int not null default 0,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  original_path text not null unique,      -- object key in PortfolioPhotos (private)
  web_path text not null,                  -- object key in portfolio-web (public, ~2400px)
  width int not null check (width > 0),
  height int not null check (height > 0),
  bytes int,
  blur_data_url text,
  dominant_color text,
  alt text check (char_length(alt) <= 300),
  caption text check (char_length(caption) <= 1000),
  sort_order int not null default 0,
  is_published boolean not null default true,
  taken_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories
  drop constraint if exists categories_cover_photo_fk,
  add constraint categories_cover_photo_fk foreign key (cover_photo_id) references public.photos(id) on delete set null;
alter table public.projects
  drop constraint if exists projects_cover_photo_fk,
  add constraint projects_cover_photo_fk foreign key (cover_photo_id) references public.photos(id) on delete set null;

create index if not exists photos_project_sort_idx on public.photos (project_id, sort_order, created_at);
create index if not exists projects_category_sort_idx on public.projects (category_id, sort_order, created_at);
create index if not exists projects_featured_idx on public.projects (is_featured) where is_featured;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists photos_set_updated_at on public.photos;
create trigger photos_set_updated_at before update on public.photos for each row execute function public.set_updated_at();

-- Inquiries (public form submissions)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'other' check (kind in ('retainer','headshots','event','product','mini_session','other')),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  phone text check (char_length(phone) <= 40),
  company text check (char_length(company) <= 160),
  message text not null check (char_length(message) between 1 and 5000),
  budget text check (char_length(budget) <= 80),
  timeline text check (char_length(timeline) <= 200),
  location text check (char_length(location) <= 160),
  source text check (char_length(source) <= 200),
  status text not null default 'new' check (status in ('new','read','replied','archived')),
  admin_notes text check (char_length(admin_notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists inquiries_status_created_idx on public.inquiries (status, created_at desc);
drop trigger if exists inquiries_set_updated_at on public.inquiries;
create trigger inquiries_set_updated_at before update on public.inquiries for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.photos enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read" on public.categories for select to anon, authenticated using (is_published or public.is_admin());
drop policy if exists "categories: admin write" on public.categories;
create policy "categories: admin write" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "projects: public read" on public.projects;
create policy "projects: public read" on public.projects for select to anon, authenticated using (is_published or public.is_admin());
drop policy if exists "projects: admin write" on public.projects;
create policy "projects: admin write" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "photos: public read" on public.photos;
create policy "photos: public read" on public.photos for select to anon, authenticated using (is_published or public.is_admin());
drop policy if exists "photos: admin write" on public.photos;
create policy "photos: admin write" on public.photos for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inquiries: anyone can submit" on public.inquiries;
create policy "inquiries: anyone can submit" on public.inquiries for insert to anon, authenticated with check (status = 'new' and admin_notes is null);
drop policy if exists "inquiries: admin read" on public.inquiries;
create policy "inquiries: admin read" on public.inquiries for select to authenticated using (public.is_admin());
drop policy if exists "inquiries: admin update" on public.inquiries;
create policy "inquiries: admin update" on public.inquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "inquiries: admin delete" on public.inquiries;
create policy "inquiries: admin delete" on public.inquiries for delete to authenticated using (public.is_admin());

-- Storage: originals stay private in PortfolioPhotos; web derivatives live in a public bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-web', 'portfolio-web', true, 26214400, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

drop policy if exists "originals: admin all" on storage.objects;
create policy "originals: admin all" on storage.objects for all to authenticated
  using (bucket_id = 'PortfolioPhotos' and public.is_admin()) with check (bucket_id = 'PortfolioPhotos' and public.is_admin());
drop policy if exists "web: public read" on storage.objects;
create policy "web: public read" on storage.objects for select to anon, authenticated using (bucket_id = 'portfolio-web');
drop policy if exists "web: admin all" on storage.objects;
create policy "web: admin all" on storage.objects for all to authenticated
  using (bucket_id = 'portfolio-web' and public.is_admin()) with check (bucket_id = 'portfolio-web' and public.is_admin());
