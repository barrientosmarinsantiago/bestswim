-- Best Swim — Verificación del esquema de producción
-- Ejecutar en el SQL Editor de Supabase tras correr los pasos 1–9 de
-- docs/SUPABASE-ORDEN-DESPLIEGUE.md. Es de solo lectura (salvo el repair opcional del punto 6).

-- 1. Todas las tablas requeridas deben aparecer (15 filas).
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles', 'subscriptions', 'programs', 'challenges', 'training_sessions', 'leads',
    'media_items', 'content_groups', 'profile_content_groups', 'group_email_invites',
    'training_session_groups', 'training_session_imports', 'group_email_imports',
    'client_performance_metrics', 'training_session_completions'
  )
order by table_name;

-- 2. Columnas críticas de profiles (deben estar TODAS).
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
  and column_name in (
    'role', 'access_tier', 'trial_started_at', 'trial_ends_at', 'body_factory_student',
    'swim_level', 'training_goal', 'competition_goal', 'onboarding_group_slug',
    'onboarding_completed_at', 'stripe_customer_id'
  )
order by column_name;

-- 3. Columnas de gating en training_sessions (source_key, access_scope).
select column_name
from information_schema.columns
where table_schema = 'public' and table_name = 'training_sessions'
  and column_name in ('source_key', 'access_scope')
order by column_name;

-- 4. Funciones requeridas en public y private.
select routine_schema, routine_name
from information_schema.routines
where (routine_schema = 'public' and routine_name in (
        'touch_updated_at', 'handle_new_user', 'is_admin', 'current_profile_role',
        'current_profile_stripe_customer_id', 'has_active_subscription', 'has_portal_access'))
   or (routine_schema = 'private' and routine_name in (
        'current_user_email', 'user_has_content_group', 'user_has_training_session_group'))
order by routine_schema, routine_name;

-- 5. RLS activa en todas las tablas (rowsecurity debe ser true en las 15).
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles', 'subscriptions', 'programs', 'challenges', 'training_sessions', 'leads',
    'media_items', 'content_groups', 'profile_content_groups', 'group_email_invites',
    'training_session_groups', 'training_session_imports', 'group_email_imports',
    'client_performance_metrics', 'training_session_completions'
  )
order by tablename;

-- 6. La política RLS FINAL de training_sessions debe ser 'training_select_published_by_scope'
--    (las antiguas 'training_select_published_for_subscribers'/'...for_portal_access' NO deben existir).
select policyname, cmd
from pg_policies
where schemaname = 'public' and tablename = 'training_sessions'
order by policyname;

-- 7. Reparar perfiles de usuarios de auth que no tengan fila en profiles (opcional, seguro).
insert into public.profiles (id, email)
select id, email
from auth.users
where not exists (select 1 from public.profiles where profiles.id = users.id)
on conflict (id) do nothing;

-- 8. Confirmar admin y muestra de perfiles.
select id, email, role, access_tier, trial_ends_at, body_factory_student
from public.profiles
order by created_at desc
limit 10;

-- 9. Confirmar contenido y grupos sembrados.
select count(*) as total_sessions, count(*) filter (where published) as publicadas
from public.training_sessions;

select slug, group_type, active from public.content_groups order by slug;
