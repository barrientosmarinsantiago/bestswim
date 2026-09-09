-- Best Swim production access groups
-- Run after docs/supabase-group-access-bootstrap.sql or docs/supabase-group-access-migration.sql.
--
-- These are data rows, not schema changes. Re-running this file is safe.

insert into public.content_groups (slug, name, description, group_type, active)
values
  (
    'Clientes_Body_Factory',
    '{"es":"Clientes Body Factory","en":"Body Factory Clients","pt":"Clientes Body Factory"}',
    '{"es":"Acceso permanente para alumnos presenciales de Body Factory.","en":"Permanent access for in-person Body Factory swimmers.","pt":"Acesso permanente para alunos presenciais da Body Factory."}',
    'body_factory',
    true
  ),
  (
    'Free_Trial_15_Days',
    '{"es":"Free Trial 15 días","en":"15-Day Free Trial","pt":"Free Trial 15 dias"}',
    '{"es":"Acceso gratuito de prueba durante 15 días.","en":"Free trial access for 15 days.","pt":"Acesso gratuito de teste por 15 dias."}',
    'free_trial',
    true
  ),
  (
    'Premium_Nivel_Inicial',
    '{"es":"Premium Nivel Inicial","en":"Premium Beginner Level","pt":"Premium Nível Inicial"}',
    '{"es":"Contenido premium para nadadores de nivel inicial.","en":"Premium content for beginner swimmers.","pt":"Conteúdo premium para nadadores de nível inicial."}',
    'premium',
    true
  ),
  (
    'Premium_Nivel_Intermedio',
    '{"es":"Premium Nivel Intermedio","en":"Premium Intermediate Level","pt":"Premium Nível Intermédio"}',
    '{"es":"Contenido premium para nadadores de nivel intermedio.","en":"Premium content for intermediate swimmers.","pt":"Conteúdo premium para nadadores de nível intermédio."}',
    'premium',
    true
  ),
  (
    'Premium_Nivel_Intermedio_Avanzado',
    '{"es":"Premium Nivel Intermedio Avanzado","en":"Premium Intermediate-Advanced Level","pt":"Premium Nível Intermédio-Avançado"}',
    '{"es":"Contenido premium para nadadores de nivel intermedio avanzado.","en":"Premium content for intermediate-advanced swimmers.","pt":"Conteúdo premium para nadadores de nível intermédio-avançado."}',
    'premium',
    true
  ),
  (
    'Premium_Nivel_Avanzado',
    '{"es":"Premium Nivel Avanzado","en":"Premium Advanced Level","pt":"Premium Nível Avançado"}',
    '{"es":"Contenido premium para nadadores de nivel avanzado.","en":"Premium content for advanced swimmers.","pt":"Conteúdo premium para nadadores de nível avançado."}',
    'premium',
    true
  ),
  (
    'Premium_Triatlon',
    '{"es":"Premium Triatlón","en":"Premium Triathlon","pt":"Premium Triatlo"}',
    '{"es":"Contenido premium específico para triatlón.","en":"Premium content specific to triathlon.","pt":"Conteúdo premium específico para triatlo."}',
    'premium',
    true
  ),
  (
    'Premium_Oceanman5k',
    '{"es":"Premium Oceanman 5K","en":"Premium Oceanman 5K","pt":"Premium Oceanman 5K"}',
    '{"es":"Contenido premium orientado a preparación Oceanman 5K.","en":"Premium content for Oceanman 5K preparation.","pt":"Conteúdo premium para preparação Oceanman 5K."}',
    'premium',
    true
  ),
  (
    'Premium_Oceanman10k',
    '{"es":"Premium Oceanman 10K","en":"Premium Oceanman 10K","pt":"Premium Oceanman 10K"}',
    '{"es":"Contenido premium orientado a preparación Oceanman 10K.","en":"Premium content for Oceanman 10K preparation.","pt":"Conteúdo premium para preparação Oceanman 10K."}',
    'premium',
    true
  )
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    group_type = excluded.group_type,
    active = excluded.active,
    updated_at = now();

-- Deactivate previous starter/example groups if they were created during setup.
-- This does not delete data; it only hides those old group labels from active use.
update public.content_groups
set active = false,
    updated_at = now()
where slug in (
  'body-factory',
  'free-trial',
  'premium',
  'tecnica',
  'entrenamiento',
  'aguas-abiertas-triatlon',
  'oposiciones',
  'multimedia',
  'reto-7km',
  'reto-14km',
  'reto-21km',
  'triple-corona-extremadura'
);

select slug, group_type, active
from public.content_groups
where slug in (
  'Clientes_Body_Factory',
  'Free_Trial_15_Days',
  'Premium_Nivel_Inicial',
  'Premium_Nivel_Intermedio',
  'Premium_Nivel_Intermedio_Avanzado',
  'Premium_Nivel_Avanzado',
  'Premium_Triatlon',
  'Premium_Oceanman5k',
  'Premium_Oceanman10k'
)
order by slug;
