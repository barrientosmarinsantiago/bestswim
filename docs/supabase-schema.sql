-- Best Swim production schema
-- Run this in the Supabase SQL editor before enabling the app in production.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'member' check (role in ('member', 'admin')),
  locale text not null default 'es',
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  stripe_price_id text,
  status text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  description jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  description jsonb not null default '{}'::jsonb,
  level jsonb not null default '{}'::jsonb,
  distance text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  program_slug text not null,
  session_date date not null,
  difficulty text not null default 'medium',
  title jsonb not null,
  body jsonb not null,
  tags text[] not null default '{}',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  goal text not null,
  message text not null,
  locale text not null default 'es',
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
before update on public.subscriptions
for each row execute function public.touch_updated_at();

drop trigger if exists programs_touch_updated_at on public.programs;
create trigger programs_touch_updated_at
before update on public.programs
for each row execute function public.touch_updated_at();

drop trigger if exists challenges_touch_updated_at on public.challenges;
create trigger challenges_touch_updated_at
before update on public.challenges
for each row execute function public.touch_updated_at();

drop trigger if exists training_sessions_touch_updated_at on public.training_sessions;
create trigger training_sessions_touch_updated_at
before update on public.training_sessions
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

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

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_profile_stripe_customer_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select stripe_customer_id from public.profiles where id = auth.uid();
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

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.programs enable row level security;
alter table public.challenges enable row level security;
alter table public.training_sessions enable row level security;
alter table public.leads enable row level security;

grant usage on schema public to anon, authenticated, service_role;

grant select on public.programs to anon, authenticated;
grant select on public.challenges to anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select on public.subscriptions to authenticated;
grant select, insert, update, delete on public.training_sessions to authenticated;
grant insert on public.leads to anon, authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (id = auth.uid() and role = 'member' and stripe_customer_id is null);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (
  public.is_admin()
  or (
    id = auth.uid()
    and role = public.current_profile_role()
    and stripe_customer_id is not distinct from public.current_profile_stripe_customer_id()
  )
);

drop policy if exists "subscriptions_select_own_or_admin" on public.subscriptions;
create policy "subscriptions_select_own_or_admin"
on public.subscriptions for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "programs_public_or_admin_select" on public.programs;
create policy "programs_public_or_admin_select"
on public.programs for select
using (published = true or public.is_admin());

drop policy if exists "programs_admin_write" on public.programs;
create policy "programs_admin_write"
on public.programs for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "challenges_public_or_admin_select" on public.challenges;
create policy "challenges_public_or_admin_select"
on public.challenges for select
using (published = true or public.is_admin());

drop policy if exists "challenges_admin_write" on public.challenges;
create policy "challenges_admin_write"
on public.challenges for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "training_select_published_for_subscribers" on public.training_sessions;
create policy "training_select_published_for_subscribers"
on public.training_sessions for select
using ((published = true and public.has_active_subscription()) or public.is_admin());

drop policy if exists "training_admin_write" on public.training_sessions;
create policy "training_admin_write"
on public.training_sessions for all
using (public.is_admin())
with check (public.is_admin());

-- Leads are inserted by the server route with the service role key.
drop policy if exists "leads_admin_select" on public.leads;
create policy "leads_admin_select"
on public.leads for select
using (public.is_admin());
