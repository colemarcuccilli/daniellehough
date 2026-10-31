-- Client galleries (2026-10-31). A project can be shared by an unlisted link
-- (/gallery/<gallery_slug>) where guests browse photos by section (ceremony,
-- reception, ...) and download the originals from the private bucket.
-- Applied to FreeWebsites (ref nxhwqtqroyerbbklywyn) via the Supabase MCP.

alter table vh.projects
  add column gallery_slug      text unique check (gallery_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  add column gallery_enabled   boolean not null default false,
  add column gallery_downloads boolean not null default true,
  add column gallery_intro     text check (char_length(gallery_intro) <= 2000);

create table vh.sections (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references vh.projects(id) on delete cascade,
  slug       text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name       text not null check (char_length(name) between 1 and 80),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, slug)
);
create index sections_project_sort_idx on vh.sections (project_id, sort_order);
create trigger sections_set_updated_at before update on vh.sections
  for each row execute function vh.set_updated_at();

alter table vh.photos add column section_id uuid references vh.sections(id) on delete set null;
create index photos_section_idx on vh.photos (section_id);

alter table vh.sections enable row level security;
grant select, insert, update, delete on vh.sections to anon, authenticated, service_role;

-- Visible exactly when the parent project is (RLS on vh.projects applies to the subquery).
create policy "sections: public read" on vh.sections for select to anon, authenticated
  using (exists (select 1 from vh.projects p where p.id = sections.project_id));
create policy "sections: admin write" on vh.sections for all to authenticated
  using (vh.is_admin()) with check (vh.is_admin());

-- Gallery projects are readable even when they are not in the public portfolio.
drop policy "projects: public read" on vh.projects;
create policy "projects: public read" on vh.projects for select to anon, authenticated
  using (is_published or gallery_enabled or vh.is_admin());

-- Guests may create signed URLs for the originals of a gallery project with
-- downloads switched on. Per object, so nothing else in vh-originals opens up.
create or replace function vh.can_download_original(object_name text)
returns boolean
language sql stable security definer
set search_path to 'vh'
as $$
  select exists (
    select 1
    from vh.photos ph
    join vh.projects p on p.id = ph.project_id
    where ph.original_path = object_name
      and ph.is_published
      and p.gallery_enabled
      and p.gallery_downloads
  );
$$;
revoke all on function vh.can_download_original(text) from public;
grant execute on function vh.can_download_original(text) to anon, authenticated, service_role;

create policy "vh originals: gallery download" on storage.objects for select to anon, authenticated
  using (bucket_id = 'vh-originals' and vh.can_download_original(name));
