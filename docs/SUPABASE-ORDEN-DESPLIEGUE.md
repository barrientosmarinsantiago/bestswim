# Best Swim — Orden canónico de despliegue de Supabase

Guía única y reproducible para montar la base de datos en un proyecto Supabase **desde cero**.
Todos los scripts son idempotentes (`if not exists`, `create or replace`, `on conflict`), así que
re-ejecutarlos es seguro. **El orden importa**: la política RLS de `training_sessions` se
redefine en varias migraciones y hay dependencias de datos entre los *seeds*.

> Por qué hacía falta esta guía: el esquema estaba repartido en ~11 ficheros `.sql` sin un
> orden documentado, y `supabase-schema.sql` define una política inicial (`training_select_published_for_subscribers`)
> que migraciones posteriores **reemplazan**. Siguiendo este orden, el estado final es correcto.

## Orden de ejecución (SQL Editor de Supabase)

| # | Archivo | Tipo | Qué hace |
|---|---|---|---|
| 1 | [`supabase-schema.sql`](supabase-schema.sql) | DDL base | Tablas `profiles`, `subscriptions`, `programs`, `challenges`, `training_sessions`, `leads`; funciones `touch_updated_at`, `handle_new_user`, `is_admin`, `current_profile_role`, `current_profile_stripe_customer_id`, `has_active_subscription`; trigger de alta de usuario; RLS base. |
| 2 | [`supabase-portal-access-migration.sql`](supabase-portal-access-migration.sql) | DDL | Columnas `profiles.access_tier/trial_started_at/trial_ends_at/body_factory_student`; tabla `media_items`; función `has_portal_access`; **reemplaza** la RLS de `training_sessions` por la de portal. |
| 3 | [`supabase-group-access-migration.sql`](supabase-group-access-migration.sql) | DDL | Esquema `private` + funciones de grupo; tablas `content_groups`, `profile_content_groups`, `group_email_invites`, `training_session_groups`, `training_session_imports`, `group_email_imports`; columnas `training_sessions.source_key/access_scope`; **política RLS final** `training_select_published_by_scope` (por `access_scope`: portal/premium/group). |
| 4 | [`supabase-client-performance-metrics.sql`](supabase-client-performance-metrics.sql) | DDL | Tabla `client_performance_metrics` + RLS (cada usuario ve solo lo suyo). |
| 5 | [`supabase-best-swim-groups-seed.sql`](supabase-best-swim-groups-seed.sql) | Datos | Grupos de producción: `Clientes_Body_Factory`, `Free_Trial_15_Days`, `Premium_*`, `Premium_Triatlon`, `Premium_Oceanman5k/10k`, etc. (los slugs que usa la ruta de onboarding). |
| 6 | [`supabase-client-onboarding-logic.sql`](supabase-client-onboarding-logic.sql) | DDL + Datos | Columnas de onboarding en `profiles` (`swim_level`, `training_goal`, `competition_goal`, `onboarding_group_slug`, `onboarding_completed_at`); grupos `nivel-*`/`reto-*`/`oceanman-5k`; sesiones plantilla y de retos. |
| 7 | [`supabase-session-completions-and-triathlon-seed.sql`](supabase-session-completions-and-triathlon-seed.sql) | DDL + Datos | Tabla `training_session_completions` (**la usa el portal** para marcar sesiones hechas) + RLS; asignación de ejemplo a `Premium_Triatlon`. Depende del paso 5. |
| 8 | [`supabase-api-grants-fix.sql`](supabase-api-grants-fix.sql) | Grants | Reaplica los `GRANT` para que los roles `anon`/`authenticated` lleguen a las tablas (la RLS sigue controlando filas). Idempotente. |
| 9 | [`supabase-admin-access-fix.sql`](supabase-admin-access-fix.sql) | Grants + admin | Grants + marca a tu cuenta como `admin`. **Edita el email** (`bestswim.info@gmail.com`) antes de ejecutar. |
| 10 | [`supabase-verificacion.sql`](supabase-verificacion.sql) | Verificación | Comprueba tablas, columnas, funciones, RLS activa y políticas. No modifica datos (salvo el repair opcional de perfiles). |

### Notas
- **`supabase-group-access-bootstrap.sql`** es un subconjunto del paso 3 (crea solo las tablas de grupos). **No** es necesario en este orden; úsalo solo como red de seguridad si ejecutaste algo fuera de orden y `select to_regclass('public.content_groups')` devuelve `NULL`.
- **`supabase-debug-checks.sql`** queda cubierto y ampliado por `supabase-verificacion.sql`; se conserva por compatibilidad.
- Los pasos 1–4 son **DDL puro** (estructura). Los pasos 5–7 incluyen **datos de ejemplo**; en producción real puedes sustituir los *seeds* por tu carga de contenido vía las tablas `*_imports` y el panel de admin.

## Modelo de acceso (resumen)
`training_sessions.access_scope` decide la visibilidad (RLS `training_select_published_by_scope`):
- **`portal`** → cualquier usuario autenticado con acceso al portal.
- **`premium`** → requiere suscripción activa (`has_active_subscription()`) o admin.
- **`group`** → requiere pertenencia al grupo de la sesión (`profile_content_groups` activa o invitación por email), vía `private.user_has_training_session_group()`.
Admin (`profiles.role = 'admin'`) siempre ve y escribe todo.

## Checklist de producción
- [ ] Ejecutar pasos 1–9 en orden en el proyecto Supabase de producción.
- [ ] Ejecutar `supabase-verificacion.sql` y confirmar que **no falta** ninguna tabla/función/política y que **RLS = true** en todas las tablas.
- [ ] Confirmar tu usuario admin (`select email, role from public.profiles where role = 'admin'`).
- [ ] Configurar los proveedores OAuth (Google/Facebook/Apple) y las URLs de redirect `https://bestswim.es/{es,en,pt}/auth/callback`.
- [ ] Probar acceso con un usuario **free** y uno **premium** y verificar que el contenido premium solo aparece para premium (cierra el bucle con las tareas #2 y #9).

> Recomendación de escala: cuando crezca, migrar estos scripts a **Supabase CLI migrations**
> (`supabase/migrations/NNNN_*.sql`) para versionado y despliegue automatizado en CI.
