-- Best Swim client onboarding logic
-- Stores the first-login questionnaire answers, creates decision groups,
-- publishes two-week template sessions, and wires challenge groups.

alter table public.profiles
add column if not exists swim_level text
  check (swim_level in ('no_se_nadar', 'principiante', 'intermedio', 'intermedio_avanzado', 'avanzado'));

alter table public.profiles
add column if not exists training_goal text
  check (training_goal in ('aprendizaje_salud', 'preparacion_competitiva'));

alter table public.profiles
add column if not exists competition_goal text
  check (competition_goal is null or competition_goal in ('triatlon_sprint_olimpico', 'ironman_70_3', 'oceanman_5k_10k'));

alter table public.profiles
add column if not exists onboarding_group_slug text;

alter table public.profiles
add column if not exists onboarding_completed_at timestamptz;

grant select on table public.content_groups to service_role;
grant select on table public.subscriptions to service_role;
grant select, insert, update on table public.profiles to service_role;
grant select, insert, update on table public.profile_content_groups to service_role;

insert into public.content_groups (slug, name, description, group_type, active)
values
  (
    'nivel-principiante',
    jsonb_build_object('es', 'Principiante', 'en', 'Beginner', 'pt', 'Principiante'),
    jsonb_build_object('es', 'Plan inicial para aprendizaje, tecnica basica y salud.'),
    'program',
    true
  ),
  (
    'nivel-intermedio',
    jsonb_build_object('es', 'Intermedio', 'en', 'Intermediate', 'pt', 'Intermedio'),
    jsonb_build_object('es', 'Plan inicial para nadadores con base tecnica y continuidad.'),
    'program',
    true
  ),
  (
    'nivel-intermedio-avanzado',
    jsonb_build_object('es', 'Intermedio-Avanzado', 'en', 'Intermediate-Advanced', 'pt', 'Intermedio-Avancado'),
    jsonb_build_object('es', 'Plan inicial para nadadores con volumen y tecnica consistente.'),
    'program',
    true
  ),
  (
    'nivel-avanzado',
    jsonb_build_object('es', 'Avanzado', 'en', 'Advanced', 'pt', 'Avancado'),
    jsonb_build_object('es', 'Plan inicial avanzado para nadadores con alta autonomia.'),
    'program',
    true
  ),
  (
    'oceanman-5k',
    jsonb_build_object('es', 'Oceanman 5K', 'en', 'Oceanman 5K', 'pt', 'Oceanman 5K'),
    jsonb_build_object('es', 'Plan competitivo placeholder para preparacion Oceanman 5K.'),
    'program',
    true
  ),
  (
    'reto-7km',
    jsonb_build_object('es', 'Desafio 7K', 'en', '7K Challenge', 'pt', 'Desafio 7K'),
    jsonb_build_object('es', 'Reto Alcatraz 7K asignado a Principiante.'),
    'challenge',
    true
  ),
  (
    'reto-21km',
    jsonb_build_object('es', 'Desafio 21K', 'en', '21K Challenge', 'pt', 'Desafio 21K'),
    jsonb_build_object('es', 'Reto Riviera Francesa 21K asignado a Avanzado.'),
    'challenge',
    true
  )
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    group_type = excluded.group_type,
    active = excluded.active,
    updated_at = now();

with plan_sessions (
  source_key,
  group_slug,
  program_slug,
  week_no,
  day_no,
  difficulty,
  title_es,
  body_es,
  tags
) as (
  values
    ('onboarding-principiante-w1-session-1', 'nivel-principiante', 'tecnica', 1, 1, 'principiante', 'Tecnica y aprendizaje - Sesion 1', 'Placeholder: primera sesion de tecnica y aprendizaje para Principiante.', array['onboarding','onboarding-week-1','onboarding-day-1','tecnica','principiante']),
    ('onboarding-principiante-w1-session-2', 'nivel-principiante', 'tecnica', 1, 3, 'principiante', 'Tecnica y aprendizaje - Sesion 2', 'Placeholder: segunda sesion de tecnica y aprendizaje para Principiante.', array['onboarding','onboarding-week-1','onboarding-day-3','tecnica','principiante']),
    ('onboarding-principiante-w1-session-3', 'nivel-principiante', 'tecnica', 1, 5, 'principiante', 'Tecnica y aprendizaje - Sesion 3', 'Placeholder: tercera sesion de tecnica y aprendizaje para Principiante.', array['onboarding','onboarding-week-1','onboarding-day-5','tecnica','principiante']),
    ('onboarding-principiante-w2-session-1', 'nivel-principiante', 'tecnica', 2, 1, 'principiante', 'Tecnica y aprendizaje - Sesion 4', 'Placeholder: cuarta sesion de tecnica y aprendizaje para Principiante.', array['onboarding','onboarding-week-2','onboarding-day-1','tecnica','principiante']),
    ('onboarding-principiante-w2-session-2', 'nivel-principiante', 'tecnica', 2, 3, 'principiante', 'Tecnica y aprendizaje - Sesion 5', 'Placeholder: quinta sesion de tecnica y aprendizaje para Principiante.', array['onboarding','onboarding-week-2','onboarding-day-3','tecnica','principiante']),
    ('onboarding-principiante-w2-session-3', 'nivel-principiante', 'tecnica', 2, 5, 'principiante', 'Tecnica y aprendizaje - Sesion 6', 'Placeholder: sexta sesion de tecnica y aprendizaje para Principiante.', array['onboarding','onboarding-week-2','onboarding-day-5','tecnica','principiante']),

    ('onboarding-intermedio-w1-session-1', 'nivel-intermedio', 'tecnica', 1, 1, 'intermedio', 'Tecnica y aprendizaje - Sesion 1', 'Placeholder: primera sesion tecnica para Intermedio.', array['onboarding','onboarding-week-1','onboarding-day-1','tecnica','intermedio']),
    ('onboarding-intermedio-w1-session-2', 'nivel-intermedio', 'tecnica', 1, 3, 'intermedio', 'Tecnica y aprendizaje - Sesion 2', 'Placeholder: segunda sesion tecnica para Intermedio.', array['onboarding','onboarding-week-1','onboarding-day-3','tecnica','intermedio']),
    ('onboarding-intermedio-w1-session-3', 'nivel-intermedio', 'entrenamiento', 1, 5, 'intermedio', 'Entrenamiento intermedio - Sesion 1', 'Placeholder: primera sesion de entrenamiento intermedio.', array['onboarding','onboarding-week-1','onboarding-day-5','entrenamiento','intermedio']),
    ('onboarding-intermedio-w2-session-1', 'nivel-intermedio', 'tecnica', 2, 1, 'intermedio', 'Tecnica y aprendizaje - Sesion 3', 'Placeholder: tercera sesion tecnica para Intermedio.', array['onboarding','onboarding-week-2','onboarding-day-1','tecnica','intermedio']),
    ('onboarding-intermedio-w2-session-2', 'nivel-intermedio', 'tecnica', 2, 3, 'intermedio', 'Tecnica y aprendizaje - Sesion 4', 'Placeholder: cuarta sesion tecnica para Intermedio.', array['onboarding','onboarding-week-2','onboarding-day-3','tecnica','intermedio']),
    ('onboarding-intermedio-w2-session-3', 'nivel-intermedio', 'entrenamiento', 2, 5, 'intermedio', 'Entrenamiento intermedio - Sesion 2', 'Placeholder: segunda sesion de entrenamiento intermedio.', array['onboarding','onboarding-week-2','onboarding-day-5','entrenamiento','intermedio']),

    ('onboarding-intermedio-avanzado-w1-session-1', 'nivel-intermedio-avanzado', 'entrenamiento', 1, 1, 'intermedio-avanzado', 'Entrenamiento intermedio-avanzado - Sesion 1', 'Placeholder: primera sesion intermedio-avanzado.', array['onboarding','onboarding-week-1','onboarding-day-1','entrenamiento','intermedio-avanzado']),
    ('onboarding-intermedio-avanzado-w1-session-2', 'nivel-intermedio-avanzado', 'entrenamiento', 1, 3, 'intermedio-avanzado', 'Entrenamiento intermedio-avanzado - Sesion 2', 'Placeholder: segunda sesion intermedio-avanzado.', array['onboarding','onboarding-week-1','onboarding-day-3','entrenamiento','intermedio-avanzado']),
    ('onboarding-intermedio-avanzado-w1-session-3', 'nivel-intermedio-avanzado', 'entrenamiento', 1, 5, 'intermedio-avanzado', 'Entrenamiento intermedio-avanzado - Sesion 3', 'Placeholder: tercera sesion intermedio-avanzado.', array['onboarding','onboarding-week-1','onboarding-day-5','entrenamiento','intermedio-avanzado']),
    ('onboarding-intermedio-avanzado-w2-session-1', 'nivel-intermedio-avanzado', 'entrenamiento', 2, 1, 'intermedio-avanzado', 'Entrenamiento intermedio-avanzado - Sesion 4', 'Placeholder: cuarta sesion intermedio-avanzado.', array['onboarding','onboarding-week-2','onboarding-day-1','entrenamiento','intermedio-avanzado']),
    ('onboarding-intermedio-avanzado-w2-session-2', 'nivel-intermedio-avanzado', 'entrenamiento', 2, 3, 'intermedio-avanzado', 'Entrenamiento intermedio-avanzado - Sesion 5', 'Placeholder: quinta sesion intermedio-avanzado.', array['onboarding','onboarding-week-2','onboarding-day-3','entrenamiento','intermedio-avanzado']),
    ('onboarding-intermedio-avanzado-w2-session-3', 'nivel-intermedio-avanzado', 'entrenamiento', 2, 5, 'intermedio-avanzado', 'Entrenamiento intermedio-avanzado - Sesion 6', 'Placeholder: sexta sesion intermedio-avanzado.', array['onboarding','onboarding-week-2','onboarding-day-5','entrenamiento','intermedio-avanzado']),

    ('onboarding-avanzado-w1-session-1', 'nivel-avanzado', 'entrenamiento', 1, 1, 'avanzado', 'Entrenamiento avanzado - Sesion 1', 'Placeholder: primera sesion avanzada.', array['onboarding','onboarding-week-1','onboarding-day-1','entrenamiento','avanzado']),
    ('onboarding-avanzado-w1-session-2', 'nivel-avanzado', 'entrenamiento', 1, 3, 'avanzado', 'Entrenamiento avanzado - Sesion 2', 'Placeholder: segunda sesion avanzada.', array['onboarding','onboarding-week-1','onboarding-day-3','entrenamiento','avanzado']),
    ('onboarding-avanzado-w1-session-3', 'nivel-avanzado', 'entrenamiento', 1, 5, 'avanzado', 'Entrenamiento avanzado - Sesion 3', 'Placeholder: tercera sesion avanzada.', array['onboarding','onboarding-week-1','onboarding-day-5','entrenamiento','avanzado']),
    ('onboarding-avanzado-w2-session-1', 'nivel-avanzado', 'entrenamiento', 2, 1, 'avanzado', 'Entrenamiento avanzado - Sesion 4', 'Placeholder: cuarta sesion avanzada.', array['onboarding','onboarding-week-2','onboarding-day-1','entrenamiento','avanzado']),
    ('onboarding-avanzado-w2-session-2', 'nivel-avanzado', 'entrenamiento', 2, 3, 'avanzado', 'Entrenamiento avanzado - Sesion 5', 'Placeholder: quinta sesion avanzada.', array['onboarding','onboarding-week-2','onboarding-day-3','entrenamiento','avanzado']),
    ('onboarding-avanzado-w2-session-3', 'nivel-avanzado', 'entrenamiento', 2, 5, 'avanzado', 'Entrenamiento avanzado - Sesion 6', 'Placeholder: sexta sesion avanzada.', array['onboarding','onboarding-week-2','onboarding-day-5','entrenamiento','avanzado']),

    ('onboarding-oceanman-5k-w1-session-1', 'oceanman-5k', 'oceanman-5k', 1, 1, 'competitivo', 'Oceanman 5K - Sesion 1', 'Placeholder: primera sesion competitiva Oceanman 5K.', array['onboarding','onboarding-week-1','onboarding-day-1','oceanman-5k','competitivo']),
    ('onboarding-oceanman-5k-w1-session-2', 'oceanman-5k', 'oceanman-5k', 1, 3, 'competitivo', 'Oceanman 5K - Sesion 2', 'Placeholder: segunda sesion competitiva Oceanman 5K.', array['onboarding','onboarding-week-1','onboarding-day-3','oceanman-5k','competitivo']),
    ('onboarding-oceanman-5k-w1-session-3', 'oceanman-5k', 'oceanman-5k', 1, 5, 'competitivo', 'Oceanman 5K - Sesion 3', 'Placeholder: tercera sesion competitiva Oceanman 5K.', array['onboarding','onboarding-week-1','onboarding-day-5','oceanman-5k','competitivo']),
    ('onboarding-oceanman-5k-w2-session-1', 'oceanman-5k', 'oceanman-5k', 2, 1, 'competitivo', 'Oceanman 5K - Sesion 4', 'Placeholder: cuarta sesion competitiva Oceanman 5K.', array['onboarding','onboarding-week-2','onboarding-day-1','oceanman-5k','competitivo']),
    ('onboarding-oceanman-5k-w2-session-2', 'oceanman-5k', 'oceanman-5k', 2, 3, 'competitivo', 'Oceanman 5K - Sesion 5', 'Placeholder: quinta sesion competitiva Oceanman 5K.', array['onboarding','onboarding-week-2','onboarding-day-3','oceanman-5k','competitivo']),
    ('onboarding-oceanman-5k-w2-session-3', 'oceanman-5k', 'oceanman-5k', 2, 5, 'competitivo', 'Oceanman 5K - Sesion 6', 'Placeholder: sexta sesion competitiva Oceanman 5K.', array['onboarding','onboarding-week-2','onboarding-day-5','oceanman-5k','competitivo'])
)
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
select
  source_key,
  program_slug,
  date '2026-01-05' + ((week_no - 1) * 7 + (day_no - 1)),
  difficulty,
  jsonb_build_object('es', title_es, 'en', title_es, 'pt', title_es),
  jsonb_build_object('es', body_es),
  tags,
  'group',
  true
from plan_sessions
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

with plan_links(source_key, group_slug) as (
  select source_key, group_slug
  from (values
    ('onboarding-principiante-w1-session-1', 'nivel-principiante'),
    ('onboarding-principiante-w1-session-2', 'nivel-principiante'),
    ('onboarding-principiante-w1-session-3', 'nivel-principiante'),
    ('onboarding-principiante-w2-session-1', 'nivel-principiante'),
    ('onboarding-principiante-w2-session-2', 'nivel-principiante'),
    ('onboarding-principiante-w2-session-3', 'nivel-principiante'),
    ('onboarding-intermedio-w1-session-1', 'nivel-intermedio'),
    ('onboarding-intermedio-w1-session-2', 'nivel-intermedio'),
    ('onboarding-intermedio-w1-session-3', 'nivel-intermedio'),
    ('onboarding-intermedio-w2-session-1', 'nivel-intermedio'),
    ('onboarding-intermedio-w2-session-2', 'nivel-intermedio'),
    ('onboarding-intermedio-w2-session-3', 'nivel-intermedio'),
    ('onboarding-intermedio-avanzado-w1-session-1', 'nivel-intermedio-avanzado'),
    ('onboarding-intermedio-avanzado-w1-session-2', 'nivel-intermedio-avanzado'),
    ('onboarding-intermedio-avanzado-w1-session-3', 'nivel-intermedio-avanzado'),
    ('onboarding-intermedio-avanzado-w2-session-1', 'nivel-intermedio-avanzado'),
    ('onboarding-intermedio-avanzado-w2-session-2', 'nivel-intermedio-avanzado'),
    ('onboarding-intermedio-avanzado-w2-session-3', 'nivel-intermedio-avanzado'),
    ('onboarding-avanzado-w1-session-1', 'nivel-avanzado'),
    ('onboarding-avanzado-w1-session-2', 'nivel-avanzado'),
    ('onboarding-avanzado-w1-session-3', 'nivel-avanzado'),
    ('onboarding-avanzado-w2-session-1', 'nivel-avanzado'),
    ('onboarding-avanzado-w2-session-2', 'nivel-avanzado'),
    ('onboarding-avanzado-w2-session-3', 'nivel-avanzado'),
    ('onboarding-oceanman-5k-w1-session-1', 'oceanman-5k'),
    ('onboarding-oceanman-5k-w1-session-2', 'oceanman-5k'),
    ('onboarding-oceanman-5k-w1-session-3', 'oceanman-5k'),
    ('onboarding-oceanman-5k-w2-session-1', 'oceanman-5k'),
    ('onboarding-oceanman-5k-w2-session-2', 'oceanman-5k'),
    ('onboarding-oceanman-5k-w2-session-3', 'oceanman-5k')
  ) as rows(source_key, group_slug)
)
insert into public.training_session_groups (training_session_id, group_id)
select sessions.id, groups.id
from plan_links
join public.training_sessions sessions on sessions.source_key = plan_links.source_key
join public.content_groups groups on groups.slug = plan_links.group_slug
on conflict do nothing;

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
select
  format('reto-7km-session-%s', n),
  'reto-7km',
  date '2026-01-05' + (n - 1),
  'reto 7k',
  jsonb_build_object('es', format('SESION %s', n), 'en', format('SESSION %s', n), 'pt', format('SESSAO %s', n)),
  jsonb_build_object('es', format('Volumen total 1.000m. Sesion %s del Reto 7K: Alcatraz.', n)),
  array['desafio', 'reto', 'alcatraz', '7k'],
  'group',
  true
from generate_series(1, 7) as n
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
select
  format('reto-21km-session-%s', n),
  'reto-21km',
  date '2026-01-05' + (n - 1),
  'reto 21k',
  jsonb_build_object('es', format('SESION %s', n), 'en', format('SESSION %s', n), 'pt', format('SESSAO %s', n)),
  jsonb_build_object('es', format('Volumen total 3.000m. Sesion %s del Reto 21K: Riviera Francesa.', n)),
  array['desafio', 'reto', 'riviera-francesa', '21k'],
  'group',
  true
from generate_series(1, 7) as n
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
where (
    sessions.source_key like 'reto-7km-session-%'
    and groups.slug = 'reto-7km'
  )
  or (
    sessions.source_key like 'reto-21km-session-%'
    and groups.slug = 'reto-21km'
  )
on conflict do nothing;
