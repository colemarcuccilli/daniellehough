-- Atelier — the ideas table
-- One mechanic to rule them: a partial unique index on (user_id) where status='active'
-- makes "two active ideas at once" impossible at the database layer.

create extension if not exists "uuid-ossp";

create table if not exists public.ideas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text check (char_length(description) <= 4000),
  type text not null default 'other'
    check (type in ('photo','video','series','mixed','other')),
  status text not null default 'spark'
    check (status in ('spark','active','done','archived')),
  weekly_step text check (char_length(weekly_step) <= 280),
  step_index int not null default 0,
  steps jsonb not null default '[]'::jsonb,
  tags text[] not null default array[]::text[],
  inspiration_urls text[] not null default array[]::text[],
  notes text check (char_length(notes) <= 8000),
  energy int check (energy between 1 and 5),
  created_at timestamptz not null default now(),
  activated_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz
);

-- The focus constraint: at most one active idea per user.
create unique index if not exists ideas_one_active_per_user
  on public.ideas (user_id)
  where status = 'active';

-- Common queries
create index if not exists ideas_user_status_idx
  on public.ideas (user_id, status, created_at desc);

-- Row Level Security
alter table public.ideas enable row level security;

drop policy if exists "ideas: owner read" on public.ideas;
create policy "ideas: owner read"
  on public.ideas for select
  using (auth.uid() = user_id);

drop policy if exists "ideas: owner insert" on public.ideas;
create policy "ideas: owner insert"
  on public.ideas for insert
  with check (auth.uid() = user_id);

drop policy if exists "ideas: owner update" on public.ideas;
create policy "ideas: owner update"
  on public.ideas for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "ideas: owner delete" on public.ideas;
create policy "ideas: owner delete"
  on public.ideas for delete
  using (auth.uid() = user_id);
