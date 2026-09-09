-- Best Swim session completions and one-week triathlon assignment
-- Run after docs/supabase-group-access-migration.sql and docs/supabase-best-swim-groups-seed.sql.
--
-- This creates the client completion tracker, removes the old broad sample
-- sessions, maps sbarrientosm88@gmail.com to Premium_Triatlon, publishes
-- the first three Olympic triathlon sessions for the week of 2026-06-01,
-- and assigns the persistent Estrecho 14K challenge to Premium_Triatlon.

create table if not exists public.training_session_completions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  training_session_id uuid not null references public.training_sessions(id) on delete cascade,
  completed_at timestamptz not null default now(),
  meters integer,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, training_session_id)
);

create index if not exists training_session_completions_user_completed_idx
on public.training_session_completions (user_id, completed_at desc);

create index if not exists training_session_completions_session_idx
on public.training_session_completions (training_session_id);

drop trigger if exists training_session_completions_touch_updated_at on public.training_session_completions;
create trigger training_session_completions_touch_updated_at
before update on public.training_session_completions
for each row execute function public.touch_updated_at();

alter table public.training_session_completions enable row level security;

grant select, insert, update, delete on public.training_session_completions to authenticated;

drop policy if exists "training_session_completions_select_own_or_admin" on public.training_session_completions;
create policy "training_session_completions_select_own_or_admin"
on public.training_session_completions for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "training_session_completions_insert_own" on public.training_session_completions;
create policy "training_session_completions_insert_own"
on public.training_session_completions for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.training_sessions sessions
    where sessions.id = training_session_id
      and sessions.published = true
  )
);

drop policy if exists "training_session_completions_update_own" on public.training_session_completions;
create policy "training_session_completions_update_own"
on public.training_session_completions for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "training_session_completions_delete_own" on public.training_session_completions;
create policy "training_session_completions_delete_own"
on public.training_session_completions for delete
to authenticated
using (user_id = auth.uid() or public.is_admin());

insert into public.profiles (id, email, locale)
select id, email, 'es'
from auth.users
where lower(email) = lower('sbarrientosm88@gmail.com')
on conflict (id) do update
set email = excluded.email,
    updated_at = now();

insert into public.group_email_invites (group_id, email, note, status)
select id, 'sbarrientosm88@gmail.com', 'Assigned to Premium Triatlon for week 2026-06-01', 'active'
from public.content_groups
where slug = 'Premium_Triatlon'
on conflict (group_id, email_normalized) do update
set status = 'active',
    note = excluded.note;

insert into public.profile_content_groups (profile_id, group_id, status)
select users.id, groups.id, 'active'
from auth.users users
cross join public.content_groups groups
where lower(users.email) = lower('sbarrientosm88@gmail.com')
  and groups.slug = 'Premium_Triatlon'
on conflict (profile_id, group_id) do update
set status = 'active',
    assigned_at = now();

delete from public.training_session_groups
where training_session_id in (
  select id from public.training_sessions where source_key like 'sample-2026-06-auth-%'
);

delete from public.training_session_completions
where training_session_id in (
  select id from public.training_sessions where source_key like 'sample-2026-06-auth-%'
);

delete from public.training_sessions
where source_key like 'sample-2026-06-auth-%';

insert into public.training_sessions (
  source_key,
  program_slug,
  session_date,
  difficulty,
  title,
  body,
  tags,
  access_scope,
  published
)
values
  (
    'preparacion-triatlon-olimpico-2026-w23-session-1',
    'aguas-abiertas-triatlon',
    '2026-06-03',
    'intermedio',
    jsonb_build_object('es', 'SESION 1', 'en', 'SESSION 1', 'pt', 'SESSAO 1'),
    jsonb_build_object('es', 'Volumen total 1.500m. Sesion 1 del plan Preparacion Triatlon Olimpico 1.500m.'),
    array['triatlon', 'olimpico', '1500m', 'semana-2026-23'],
    'group',
    true
  ),
  (
    'preparacion-triatlon-olimpico-2026-w23-session-2',
    'aguas-abiertas-triatlon',
    '2026-06-05',
    'intermedio',
    jsonb_build_object('es', 'SESION 2', 'en', 'SESSION 2', 'pt', 'SESSAO 2'),
    jsonb_build_object('es', 'Volumen total 1.500m. Sesion 2 del plan Preparacion Triatlon Olimpico 1.500m.'),
    array['triatlon', 'olimpico', '1500m', 'semana-2026-23'],
    'group',
    true
  ),
  (
    'preparacion-triatlon-olimpico-2026-w23-session-3',
    'aguas-abiertas-triatlon',
    '2026-06-07',
    'intermedio',
    jsonb_build_object('es', 'SESION 3', 'en', 'SESSION 3', 'pt', 'SESSAO 3'),
    jsonb_build_object('es', 'Volumen total 1.500m. Sesion 3 del plan Preparacion Triatlon Olimpico 1.500m.'),
    array['triatlon', 'olimpico', '1500m', 'semana-2026-23'],
    'group',
    true
  )
on conflict (source_key) where source_key is not null do update
set program_slug = excluded.program_slug,
    session_date = excluded.session_date,
    difficulty = excluded.difficulty,
    title = excluded.title,
    body = excluded.body,
    tags = excluded.tags,
    access_scope = excluded.access_scope,
    published = excluded.published,
    updated_at = now();

insert into public.training_session_groups (training_session_id, group_id)
select sessions.id, groups.id
from public.training_sessions sessions
cross join public.content_groups groups
where sessions.source_key in (
  'preparacion-triatlon-olimpico-2026-w23-session-1',
  'preparacion-triatlon-olimpico-2026-w23-session-2',
  'preparacion-triatlon-olimpico-2026-w23-session-3'
)
  and groups.slug = 'Premium_Triatlon'
on conflict do nothing;

insert into public.content_groups (slug, name, description, group_type, active)
values (
  'reto-14km-estrecho',
  jsonb_build_object(
    'es', 'Desafio Estrecho de Gibraltar 14K',
    'en', 'Strait of Gibraltar 14K Challenge',
    'pt', 'Desafio Estreito de Gibraltar 14K'
  ),
  jsonb_build_object(
    'es', 'Reto persistente fuera del plan semanal para completar las 7 sesiones de 2.000m del Estrecho de Gibraltar.',
    'en', 'Persistent challenge outside the weekly plan to complete the 7 x 2,000m Strait of Gibraltar sessions.',
    'pt', 'Desafio persistente fora do plano semanal para concluir as 7 sessoes de 2.000m do Estreito de Gibraltar.'
  ),
  'challenge',
  true
)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    group_type = excluded.group_type,
    active = excluded.active,
    updated_at = now();

insert into public.profile_content_groups (profile_id, group_id, status)
select premium_members.profile_id, challenge_group.id, 'active'
from public.profile_content_groups premium_members
join public.content_groups premium_group on premium_group.id = premium_members.group_id
cross join public.content_groups challenge_group
where premium_group.slug = 'Premium_Triatlon'
  and premium_members.status = 'active'
  and challenge_group.slug = 'reto-14km-estrecho'
on conflict (profile_id, group_id) do update
set status = 'active',
    assigned_at = now();

insert into public.group_email_invites (group_id, email, note, status)
select challenge_group.id, invites.email, 'Assigned via Premium_Triatlon persistent Estrecho 14K challenge', 'active'
from public.group_email_invites invites
join public.content_groups premium_group on premium_group.id = invites.group_id
cross join public.content_groups challenge_group
where premium_group.slug = 'Premium_Triatlon'
  and invites.status = 'active'
  and challenge_group.slug = 'reto-14km-estrecho'
on conflict (group_id, email_normalized) do update
set status = 'active',
    note = excluded.note;

insert into public.training_sessions (
  source_key,
  program_slug,
  session_date,
  difficulty,
  title,
  body,
  tags,
  access_scope,
  published
)
values
  (
    'reto-14km-estrecho-session-1',
    'reto-14km-estrecho',
    '2026-06-03',
    'reto 14k',
    jsonb_build_object('es', 'SESION 1', 'en', 'SESSION 1', 'pt', 'SESSAO 1'),
    jsonb_build_object('es', 'Volumen total 2.000m. Sesion 1 del Reto 14K: Estrecho de Gibraltar.'),
    array['desafio', 'reto', 'estrecho-14k', 'gibraltar', '14k'],
    'group',
    true
  ),
  (
    'reto-14km-estrecho-session-2',
    'reto-14km-estrecho',
    '2026-06-04',
    'reto 14k',
    jsonb_build_object('es', 'SESION 2', 'en', 'SESSION 2', 'pt', 'SESSAO 2'),
    jsonb_build_object('es', 'Volumen total 2.000m. Sesion 2 del Reto 14K: Estrecho de Gibraltar.'),
    array['desafio', 'reto', 'estrecho-14k', 'gibraltar', '14k'],
    'group',
    true
  ),
  (
    'reto-14km-estrecho-session-3',
    'reto-14km-estrecho',
    '2026-06-05',
    'reto 14k',
    jsonb_build_object('es', 'SESION 3', 'en', 'SESSION 3', 'pt', 'SESSAO 3'),
    jsonb_build_object('es', 'Volumen total 2.000m. Sesion 3 del Reto 14K: Estrecho de Gibraltar.'),
    array['desafio', 'reto', 'estrecho-14k', 'gibraltar', '14k'],
    'group',
    true
  ),
  (
    'reto-14km-estrecho-session-4',
    'reto-14km-estrecho',
    '2026-06-06',
    'reto 14k',
    jsonb_build_object('es', 'SESION 4', 'en', 'SESSION 4', 'pt', 'SESSAO 4'),
    jsonb_build_object('es', 'Volumen total 2.000m. Sesion 4 del Reto 14K: Estrecho de Gibraltar.'),
    array['desafio', 'reto', 'estrecho-14k', 'gibraltar', '14k'],
    'group',
    true
  ),
  (
    'reto-14km-estrecho-session-5',
    'reto-14km-estrecho',
    '2026-06-07',
    'reto 14k',
    jsonb_build_object('es', 'SESION 5', 'en', 'SESSION 5', 'pt', 'SESSAO 5'),
    jsonb_build_object('es', 'Volumen total 2.000m. Sesion 5 del Reto 14K: Estrecho de Gibraltar.'),
    array['desafio', 'reto', 'estrecho-14k', 'gibraltar', '14k'],
    'group',
    true
  ),
  (
    'reto-14km-estrecho-session-6',
    'reto-14km-estrecho',
    '2026-06-08',
    'reto 14k',
    jsonb_build_object('es', 'SESION 6', 'en', 'SESSION 6', 'pt', 'SESSAO 6'),
    jsonb_build_object('es', 'Volumen total 2.000m. Sesion 6 del Reto 14K: Estrecho de Gibraltar.'),
    array['desafio', 'reto', 'estrecho-14k', 'gibraltar', '14k'],
    'group',
    true
  ),
  (
    'reto-14km-estrecho-session-7',
    'reto-14km-estrecho',
    '2026-06-09',
    'reto 14k',
    jsonb_build_object('es', 'SESION 7', 'en', 'SESSION 7', 'pt', 'SESSAO 7'),
    jsonb_build_object('es', 'Volumen total 2.000m. Sesion 7 del Reto 14K: Estrecho de Gibraltar.'),
    array['desafio', 'reto', 'estrecho-14k', 'gibraltar', '14k'],
    'group',
    true
  )
on conflict (source_key) where source_key is not null do update
set program_slug = excluded.program_slug,
    session_date = excluded.session_date,
    difficulty = excluded.difficulty,
    title = excluded.title,
    body = excluded.body,
    tags = excluded.tags,
    access_scope = excluded.access_scope,
    published = excluded.published,
    updated_at = now();

insert into public.training_session_groups (training_session_id, group_id)
select sessions.id, groups.id
from public.training_sessions sessions
cross join public.content_groups groups
where sessions.source_key in (
  'reto-14km-estrecho-session-1',
  'reto-14km-estrecho-session-2',
  'reto-14km-estrecho-session-3',
  'reto-14km-estrecho-session-4',
  'reto-14km-estrecho-session-5',
  'reto-14km-estrecho-session-6',
  'reto-14km-estrecho-session-7'
)
  and groups.slug in ('Premium_Triatlon', 'reto-14km-estrecho')
on conflict do nothing;
