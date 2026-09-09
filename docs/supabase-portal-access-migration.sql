-- Best Swim portal access migration
-- Run after docs/supabase-schema.sql.
-- This adds Free Trial / Body Factory / Premium access logic for protected portal content.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.has_active_subscription()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = auth.uid()
      and status in ('active', 'trialing')
      and (current_period_end is null or current_period_end > now())
  );
$$;

alter table public.profiles
add column if not exists access_tier text not null default 'free'
check (access_tier in ('free', 'premium'));

alter table public.profiles
add column if not exists trial_started_at timestamptz not null default now();

alter table public.profiles
add column if not exists trial_ends_at timestamptz not null default (now() + interval '15 days');

alter table public.profiles
add column if not exists body_factory_student boolean not null default false;

update public.profiles
set trial_started_at = coalesce(trial_started_at, now()),
    trial_ends_at = coalesce(trial_ends_at, now() + interval '15 days')
where trial_started_at is null
   or trial_ends_at is null;

create table if not exists public.media_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  description jsonb not null default '{}'::jsonb,
  media_type text not null check (media_type in ('video', 'image', 'document', 'link')),
  storage_path text,
  external_url text,
  thumbnail_path text,
  program_slug text,
  tags text[] not null default '{}',
  access_level text not null default 'premium' check (access_level in ('public', 'free', 'premium')),
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists media_items_touch_updated_at on public.media_items;
create trigger media_items_touch_updated_at
before update on public.media_items
for each row execute function public.touch_updated_at();

create or replace function public.has_portal_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or public.has_active_subscription()
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and (
          body_factory_student = true
          or trial_ends_at > now()
          or access_tier = 'premium'
        )
    );
$$;

alter table public.media_items enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update on public.profiles to authenticated;
grant select on public.subscriptions to authenticated;
grant select, insert, update, delete on public.training_sessions to authenticated;
grant select on public.media_items to anon;
grant select, insert, update, delete on public.media_items to authenticated;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_active_subscription() to authenticated;
grant execute on function public.has_portal_access() to authenticated;

drop policy if exists "training_select_published_for_subscribers" on public.training_sessions;
drop policy if exists "training_select_published_for_portal_access" on public.training_sessions;
create policy "training_select_published_for_portal_access"
on public.training_sessions for select
using ((published = true and public.has_portal_access()) or public.is_admin());

drop policy if exists "media_items_public_or_portal_access_select" on public.media_items;
create policy "media_items_public_or_portal_access_select"
on public.media_items for select
using (
  (published = true and access_level = 'public')
  or (published = true and access_level = 'free' and public.has_portal_access())
  or (published = true and access_level = 'premium' and (public.has_active_subscription() or public.is_admin()))
  or public.is_admin()
);

drop policy if exists "media_items_admin_write" on public.media_items;
create policy "media_items_admin_write"
on public.media_items for all
using (public.is_admin())
with check (public.is_admin());
