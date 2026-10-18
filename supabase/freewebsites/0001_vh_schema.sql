-- FreeWebsites (ref nxhwqtqroyerbbklywyn): VisionaryHaus / Dani Cams moves into its
-- own `vh` schema, with buckets `vh-originals` (private) and `vh-web` (public).
-- Same tables, checks, FKs, indexes, triggers and RLS as 0001_visionaryhaus.sql
-- on the old project (verified against the live DB on 2026-10-17).
--
-- Admins still sign in with Supabase Auth; their auth.users rows move with the
-- same ids, so `vh.admins` keeps pointing at them. Every write policy checks
-- vh.is_admin(), so other FreeWebsites users (or anyone who signs up) get
-- nothing beyond the public reads.

create schema if not exists vh;
revoke all on schema vh from public;
grant usage on schema vh to anon, authenticated, service_role;

create table vh.admins (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  email        text not null unique,
  display_name text,
  created_at   timestamptz not null default now()
);

create or replace function vh.is_admin()
returns boolean
language sql stable security definer
set search_path to 'vh'
as $$
  select exists (select 1 from vh.admins a where a.user_id = auth.uid());
$$;

create or replace function vh.set_updated_at()
returns trigger
language plpgsql
set search_path to 'vh'
as $$
begin
  new.updated_at = now();
  return new;
end $$;

create table vh.categories (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name           text not null check (char_length(name) between 1 and 80),
  tagline        text check (char_length(tagline) <= 200),
  description    text check (char_length(description) <= 4000),
  cover_photo_id uuid,
  sort_order     int not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table vh.projects (
  id             uuid primary key default gen_random_uuid(),
  category_id    uuid references vh.categories(id) on delete set null,
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title          text not null check (char_length(title) between 1 and 120),
  subtitle       text check (char_length(subtitle) <= 200),
  description    text check (char_length(description) <= 6000),
  client         text check (char_length(client) <= 120),
  location       text check (char_length(location) <= 120),
  shot_on        date,
  cover_photo_id uuid,
  sort_order     int not null default 0,
  is_published   boolean not null default true,
  is_featured    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index projects_category_sort_idx on vh.projects (category_id, sort_order, created_at);
create index projects_featured_idx on vh.projects (is_featured) where is_featured;

create table vh.photos (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references vh.projects(id) on delete cascade,
  original_path  text not null unique,
  web_path       text not null,
  width          int not null check (width > 0),
  height         int not null check (height > 0),
  bytes          int,
  blur_data_url  text,
  dominant_color text,
  alt            text check (char_length(alt) <= 300),
  caption        text check (char_length(caption) <= 1000),
  sort_order     int not null default 0,
  is_published   boolean not null default true,
  taken_at       timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index photos_project_sort_idx on vh.photos (project_id, sort_order, created_at);

alter table vh.categories add constraint categories_cover_photo_fk
  foreign key (cover_photo_id) references vh.photos(id) on delete set null;
alter table vh.projects add constraint projects_cover_photo_fk
  foreign key (cover_photo_id) references vh.photos(id) on delete set null;

create table vh.inquiries (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null default 'other'
              check (kind in ('retainer','headshots','event','product','mini_session','other')),
  name        text not null check (char_length(name) between 1 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  phone       text check (char_length(phone) <= 40),
  company     text check (char_length(company) <= 160),
  message     text not null check (char_length(message) between 1 and 5000),
  budget      text check (char_length(budget) <= 80),
  timeline    text check (char_length(timeline) <= 200),
  location    text check (char_length(location) <= 160),
  source      text check (char_length(source) <= 200),
  status      text not null default 'new' check (status in ('new','read','replied','archived')),
  admin_notes text check (char_length(admin_notes) <= 5000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index inquiries_status_created_idx on vh.inquiries (status, created_at desc);

create trigger categories_set_updated_at before update on vh.categories
  for each row execute function vh.set_updated_at();
create trigger projects_set_updated_at before update on vh.projects
  for each row execute function vh.set_updated_at();
create trigger photos_set_updated_at before update on vh.photos
  for each row execute function vh.set_updated_at();
create trigger inquiries_set_updated_at before update on vh.inquiries
  for each row execute function vh.set_updated_at();

alter table vh.admins     enable row level security;
alter table vh.categories enable row level security;
alter table vh.projects   enable row level security;
alter table vh.photos     enable row level security;
alter table vh.inquiries  enable row level security;

grant select, insert, update, delete on all tables in schema vh to anon, authenticated, service_role;
revoke all on function vh.is_admin() from public;
grant execute on function vh.is_admin() to anon, authenticated, service_role;

create policy "admins: read" on vh.admins for select to authenticated using (vh.is_admin());

create policy "categories: public read" on vh.categories for select to anon, authenticated
  using (is_published or vh.is_admin());
create policy "categories: admin write" on vh.categories for all to authenticated
  using (vh.is_admin()) with check (vh.is_admin());

create policy "projects: public read" on vh.projects for select to anon, authenticated
  using (is_published or vh.is_admin());
create policy "projects: admin write" on vh.projects for all to authenticated
  using (vh.is_admin()) with check (vh.is_admin());

create policy "photos: public read" on vh.photos for select to anon, authenticated
  using (is_published or vh.is_admin());
create policy "photos: admin write" on vh.photos for all to authenticated
  using (vh.is_admin()) with check (vh.is_admin());

create policy "inquiries: anyone can submit" on vh.inquiries for insert to anon, authenticated
  with check (status = 'new' and admin_notes is null);
create policy "inquiries: admin read" on vh.inquiries for select to authenticated using (vh.is_admin());
create policy "inquiries: admin update" on vh.inquiries for update to authenticated
  using (vh.is_admin()) with check (vh.is_admin());
create policy "inquiries: admin delete" on vh.inquiries for delete to authenticated using (vh.is_admin());

-- Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('vh-originals', 'vh-originals', false, null, null),
  ('vh-web', 'vh-web', true, 26214400, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

create policy "vh web: public read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'vh-web');
create policy "vh web: admin all" on storage.objects for all to authenticated
  using (bucket_id = 'vh-web' and vh.is_admin())
  with check (bucket_id = 'vh-web' and vh.is_admin());
create policy "vh originals: admin all" on storage.objects for all to authenticated
  using (bucket_id = 'vh-originals' and vh.is_admin())
  with check (bucket_id = 'vh-originals' and vh.is_admin());
