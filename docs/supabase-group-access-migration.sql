-- Best Swim group-based content access
-- Run after docs/supabase-schema.sql and docs/supabase-portal-access-migration.sql.
--
-- Purpose:
-- - Assign users to access groups in bulk.
-- - Assign training sessions to groups in bulk.
-- - Avoid per-user content changes in the website code.

create schema if not exists private;

alter table public.training_sessions
add column if not exists source_key text;

alter table public.training_sessions
add column if not exists access_scope text not null default 'portal'
check (access_scope in ('portal', 'premium', 'group'));

create unique index if not exists training_sessions_source_key_idx
on public.training_sessions (source_key)
where source_key is not null;

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

drop trigger if exists content_groups_touch_updated_at on public.content_groups;
create trigger content_groups_touch_updated_at
before update on public.content_groups
for each row execute function public.touch_updated_at();

create or replace function private.current_user_email()
returns text
language sql
stable
security definer
set search_path = auth
as $$
  select lower(email)
  from auth.users
  where id = auth.uid();
$$;

create or replace function private.user_has_content_group(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.profile_content_groups memberships
    where memberships.profile_id = auth.uid()
      and memberships.group_id = target_group_id
      and memberships.status = 'active'
  )
  or exists (
    select 1
    from public.group_email_invites invites
    where invites.group_id = target_group_id
      and invites.status = 'active'
      and invites.email_normalized = private.current_user_email()
  );
$$;

create or replace function private.user_has_training_session_group(target_training_session_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private
as $$
  select exists (
    select 1
    from public.training_session_groups session_groups
    join public.content_groups groups on groups.id = session_groups.group_id
    where session_groups.training_session_id = target_training_session_id
      and groups.active = true
      and private.user_has_content_group(groups.id)
  );
$$;

alter table public.content_groups enable row level security;
alter table public.profile_content_groups enable row level security;
alter table public.group_email_invites enable row level security;
alter table public.training_session_groups enable row level security;
alter table public.training_session_imports enable row level security;
alter table public.group_email_imports enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema private to authenticated, service_role;

grant execute on function private.current_user_email() to authenticated;
grant execute on function private.user_has_content_group(uuid) to authenticated;
grant execute on function private.user_has_training_session_group(uuid) to authenticated;

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
grant execute on all functions in schema private to service_role;

drop policy if exists "content_groups_select_authenticated" on public.content_groups;
create policy "content_groups_select_authenticated"
on public.content_groups for select
using (active = true or public.is_admin());

drop policy if exists "content_groups_admin_write" on public.content_groups;
create policy "content_groups_admin_write"
on public.content_groups for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "profile_content_groups_select_own_or_admin" on public.profile_content_groups;
create policy "profile_content_groups_select_own_or_admin"
on public.profile_content_groups for select
using (profile_id = auth.uid() or public.is_admin());

drop policy if exists "profile_content_groups_admin_write" on public.profile_content_groups;
create policy "profile_content_groups_admin_write"
on public.profile_content_groups for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "group_email_invites_admin_only" on public.group_email_invites;
create policy "group_email_invites_admin_only"
on public.group_email_invites for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "training_session_groups_select_for_members_or_admin" on public.training_session_groups;
create policy "training_session_groups_select_for_members_or_admin"
on public.training_session_groups for select
using (private.user_has_content_group(group_id) or public.is_admin());

drop policy if exists "training_session_groups_admin_write" on public.training_session_groups;
create policy "training_session_groups_admin_write"
on public.training_session_groups for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "training_session_imports_admin_only" on public.training_session_imports;
create policy "training_session_imports_admin_only"
on public.training_session_imports for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "group_email_imports_admin_only" on public.group_email_imports;
create policy "group_email_imports_admin_only"
on public.group_email_imports for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "training_select_published_for_portal_access" on public.training_sessions;
drop policy if exists "training_select_published_for_subscribers" on public.training_sessions;
create policy "training_select_published_by_scope"
on public.training_sessions for select
using (
  public.is_admin()
  or (
    published = true
    and (
      (access_scope = 'portal' and auth.uid() is not null)
      or (access_scope = 'premium' and (public.has_active_subscription() or public.is_admin()))
      or (access_scope = 'group' and private.user_has_training_session_group(id))
    )
  )
);

drop policy if exists "training_admin_write" on public.training_sessions;
create policy "training_admin_write"
on public.training_sessions for all
using (public.is_admin())
with check (public.is_admin());
