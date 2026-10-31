-- Automatic bucket import (2026-10-31). Applied to FreeWebsites via the
-- Supabase MCP. See CLAUDE.md "Client galleries".
create extension if not exists pg_net with schema extensions;

create table vh.import_claims (
  original_path text primary key,
  claimed_at    timestamptz not null default now(),
  error         text
);
alter table vh.import_claims enable row level security;
grant select, insert, update, delete on vh.import_claims to authenticated, service_role;
create policy "import claims: admin all" on vh.import_claims for all to authenticated
  using (vh.is_admin()) with check (vh.is_admin());

create table vh.sync_state (
  id               int primary key check (id = 1),
  endpoint         text not null,
  secret           text not null,
  debounce_seconds int not null default 20,
  last_poke        timestamptz
);
alter table vh.sync_state enable row level security;
revoke all on vh.sync_state from anon, authenticated;
-- insert into vh.sync_state (id, endpoint, secret) values (1, 'https://danicams.com/api/import/sync', '<CRON_SECRET>');

create or replace function vh.poke_import_sync()
returns trigger
language plpgsql security definer
set search_path = vh, extensions, net
as $$
declare
  st vh.sync_state%rowtype;
begin
  if new.bucket_id <> 'vh-originals' or new.name is null or position('/' in new.name) = 0 or new.name like '%/.%' then
    return new;
  end if;
  update vh.sync_state
     set last_poke = now()
   where id = 1
     and (last_poke is null or last_poke < now() - make_interval(secs => debounce_seconds))
  returning * into st;
  if not found then
    return new;
  end if;
  perform net.http_post(
    url := st.endpoint,
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || st.secret),
    body := jsonb_build_object('source', 'storage', 'path', new.name),
    timeout_milliseconds := 10000
  );
  return new;
end $$;

create trigger vh_originals_poke_sync
  after insert on storage.objects
  for each row execute function vh.poke_import_sync();

-- The import account: an auth user + identity, listed in vh.admins
-- (created via SQL with a bcrypt password; see supabase/seed/add_admin.sql).
