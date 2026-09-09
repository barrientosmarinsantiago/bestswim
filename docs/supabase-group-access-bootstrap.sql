-- Best Swim group access bootstrap
-- Run this if select to_regclass('public.content_groups') returns NULL.
-- It creates the group tables first, so the full migration can be run after it.

create extension if not exists "pgcrypto";

create table if not exists public.content_groups (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  group_type text not null default 'custom'
    check (group_type in ('body_factory', 'free_trial', 'premium', 'program', 'challenge', 'custom')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_content_groups (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid not null references public.content_groups(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'paused', 'revoked')),
  assigned_at timestamptz not null default now(),
  primary key (profile_id, group_id)
);

create table if not exists public.group_email_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.content_groups(id) on delete cascade,
  email text not null,
  email_normalized text generated always as (lower(trim(email))) stored,
  status text not null default 'active' check (status in ('active', 'paused', 'revoked')),
  note text,
  created_at timestamptz not null default now(),
  unique (group_id, email_normalized)
);

create table if not exists public.training_session_groups (
  training_session_id uuid not null references public.training_sessions(id) on delete cascade,
  group_id uuid not null references public.content_groups(id) on delete cascade,
  primary key (training_session_id, group_id)
);

create table if not exists public.training_session_imports (
  batch_id text not null,
  source_key text not null,
  program_slug text not null,
  session_date date not null,
  difficulty text not null default 'medium',
  title_es text not null,
  title_en text,
  title_pt text,
  body_es text not null,
  body_en text,
  body_pt text,
  tags_csv text,
  access_scope text not null default 'portal',
  group_slugs_csv text,
  published boolean not null default false,
  imported_at timestamptz not null default now()
);

create table if not exists public.group_email_imports (
  batch_id text not null,
  group_slug text not null,
  email text not null,
  note text,
  imported_at timestamptz not null default now()
);

alter table public.training_sessions
add column if not exists source_key text;

alter table public.training_sessions
add column if not exists access_scope text not null default 'portal'
check (access_scope in ('portal', 'premium', 'group'));

create unique index if not exists training_sessions_source_key_idx
on public.training_sessions (source_key)
where source_key is not null;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.content_groups to authenticated;
grant select on public.profile_content_groups to authenticated;
grant select on public.training_session_groups to authenticated;
grant select, insert, update, delete on public.training_sessions to authenticated;
grant select, insert, update, delete on public.content_groups to authenticated;
grant select, insert, update, delete on public.profile_content_groups to authenticated;
grant select, insert, update, delete on public.group_email_invites to authenticated;
grant select, insert, update, delete on public.training_session_groups to authenticated;
grant select, insert, update, delete on public.training_session_imports to authenticated;
grant select, insert, update, delete on public.group_email_imports to authenticated;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

select to_regclass('public.content_groups') as content_groups_table;
