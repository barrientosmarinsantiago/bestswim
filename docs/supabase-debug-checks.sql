-- Best Swim Supabase debug checks
-- Run these queries in Supabase SQL Editor when login/admin/content access does not behave as expected.

-- 1. Confirm required tables exist.
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'subscriptions',
    'programs',
    'challenges',
    'training_sessions',
    'leads',
    'media_items'
  )
order by table_name;

-- 2. Confirm required functions exist.
select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name in (
    'touch_updated_at',
    'handle_new_user',
    'is_admin',
    'has_active_subscription',
    'has_portal_access'
  )
order by routine_name;

-- 3. Confirm your authenticated users have matching profiles.
select id, email, created_at
from auth.users
order by created_at desc
limit 10;

select id, email, role, access_tier, trial_ends_at, body_factory_student, created_at
from public.profiles
order by created_at desc
limit 10;

-- 4. If an auth user exists without a profile, repair it.
insert into public.profiles (id, email)
select id, email
from auth.users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
)
on conflict (id) do nothing;

-- 5. Make your user admin. Replace the email first.
-- update public.profiles
-- set role = 'admin'
-- where email = 'YOUR_EMAIL@example.com';

-- 6. Confirm RLS is enabled.
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'subscriptions',
    'programs',
    'challenges',
    'training_sessions',
    'leads',
    'media_items'
  )
order by tablename;

-- 7. Confirm training content exists.
select id, program_slug, session_date, difficulty, title, published, created_at
from public.training_sessions
order by session_date desc
limit 20;

