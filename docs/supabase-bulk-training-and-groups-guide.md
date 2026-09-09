# Best Swim: Bulk Training Sessions And Group Access

This guide explains how to publish training content in Supabase without changing website files every week and without assigning sessions user by user.

## 1. Hosting Reality

Best Swim is more than a landing page. It uses:

- Supabase Auth callback routes.
- Stripe Checkout and Customer Portal API routes.
- Stripe webhook route for subscription status.
- Server-side session handling through middleware.
- Protected client portal content.

If Hostinger only receives static HTML/CSS/JS files, those server features will not run. Use Hostinger Node.js, Vercel, Render, Railway, or another host with a Node/API runtime.

Supabase remains the database and CMS. Weekly content is edited in Supabase, not in the deployed website files.

## 2. Production Groups

Use these exact `slug` values in Supabase:

```text
Clientes_Body_Factory
Free_Trial_15_Days
Premium_Nivel_Inicial
Premium_Nivel_Intermedio
Premium_Nivel_Intermedio_Avanzado
Premium_Nivel_Avanzado
Premium_Triatlon
Premium_Oceanman5k
Premium_Oceanman10k
```

Each training session gets an `access_scope`:

- `portal`: visible to any authenticated user.
- `premium`: visible only to active premium subscribers or admin.
- `group`: visible only to users in one of the session's assigned groups.

For your model, most level-specific and race-specific content should use `access_scope = 'group'`.

## 3. One-Time SQL Setup

Run these files in Supabase SQL Editor, one by one:

```text
docs/supabase-schema.sql
docs/supabase-portal-access-migration.sql
docs/supabase-api-grants-fix.sql
docs/supabase-group-access-bootstrap.sql
docs/supabase-group-access-migration.sql
docs/supabase-best-swim-groups-seed.sql
docs/supabase-session-completions-and-triathlon-seed.sql
```

If `docs/supabase-group-access-migration.sql` already works for you, the bootstrap file is optional. It is safe to run the bootstrap first when tables are missing.

Verify groups:

```sql
select slug, group_type, active
from public.content_groups
order by slug;
```

## 4. Bulk Load Body Factory Emails

Create a CSV with columns:

```csv
batch_id,group_slug,email,note
bodyfactory-2026-01,Clientes_Body_Factory,cliente1@gmail.com,Alumno Body Factory
bodyfactory-2026-01,Clientes_Body_Factory,cliente2@gmail.com,Alumno Body Factory
```

In Supabase Dashboard:

1. Go to Table Editor.
2. Open `group_email_imports`.
3. Choose `Import data from CSV`.
4. Upload the CSV.
5. Run:

```sql
insert into public.group_email_invites (group_id, email, note, status)
select groups.id, imports.email, imports.note, 'active'
from public.group_email_imports imports
join public.content_groups groups on groups.slug = imports.group_slug
where imports.batch_id = 'bodyfactory-2026-01'
on conflict (group_id, email_normalized) do update
set status = 'active',
    note = excluded.note;
```

Users can be added before they ever log in. When a Google, Facebook, or Apple user logs in with a matching email, RLS gives them access automatically.

## 5. Bulk Load Premium Group Emails

Use the same CSV structure for any group:

```csv
batch_id,group_slug,email,note
premium-inicial-2026-01,Premium_Nivel_Inicial,cliente3@gmail.com,Nivel inicial
premium-intermedio-2026-01,Premium_Nivel_Intermedio,cliente4@gmail.com,Nivel intermedio
premium-oceanman5k-2026-01,Premium_Oceanman5k,cliente5@gmail.com,Oceanman 5K
```

Then run the same insert into `group_email_invites`, changing only `batch_id`:

```sql
insert into public.group_email_invites (group_id, email, note, status)
select groups.id, imports.email, imports.note, 'active'
from public.group_email_imports imports
join public.content_groups groups on groups.slug = imports.group_slug
where imports.batch_id = 'premium-inicial-2026-01'
on conflict (group_id, email_normalized) do update
set status = 'active',
    note = excluded.note;
```

## 6. Bulk Load Training Sessions

Create a CSV with columns:

```csv
batch_id,source_key,program_slug,session_date,difficulty,title_es,title_en,title_pt,body_es,body_en,body_pt,tags_csv,access_scope,group_slugs_csv,published
week-2026-22,2026-w22-inicial-01,entrenamiento,2026-06-01,inicial,Nivel inicial - sesion 1,Beginner level - session 1,Nivel inicial - sessao 1,"Bloque tecnico y base aerobica","Technical block and aerobic base","Bloco tecnico e base aerobica","inicial,piscina",group,Premium_Nivel_Inicial,true
week-2026-22,2026-w22-intermedio-01,entrenamiento,2026-06-02,intermedio,Nivel intermedio - sesion 1,Intermediate level - session 1,Nivel intermedio - sessao 1,"Series aerobicas y tecnica","Aerobic sets and technique","Series aerobicas e tecnica","intermedio,piscina",group,Premium_Nivel_Intermedio,true
week-2026-22,2026-w22-oceanman5k-01,aguas-abiertas-triatlon,2026-06-05,intermedio,Oceanman 5K - sesion 1,Oceanman 5K - session 1,Oceanman 5K - sessao 1,"Bloque especifico aguas abiertas","Open-water specific block","Bloco especifico aguas abertas","oceanman,aguas-abiertas",group,Premium_Oceanman5k,true
```

In Supabase Dashboard:

1. Open `training_session_imports`.
2. Import the CSV.
3. Run the upsert SQL below.

```sql
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
  imports.source_key,
  imports.program_slug,
  imports.session_date,
  imports.difficulty,
  jsonb_build_object(
    'es', imports.title_es,
    'en', coalesce(nullif(imports.title_en, ''), imports.title_es),
    'pt', coalesce(nullif(imports.title_pt, ''), imports.title_es)
  ),
  jsonb_build_object(
    'es', imports.body_es,
    'en', coalesce(nullif(imports.body_en, ''), imports.body_es),
    'pt', coalesce(nullif(imports.body_pt, ''), imports.body_es)
  ),
  case
    when nullif(imports.tags_csv, '') is null then '{}'
    else string_to_array(imports.tags_csv, ',')
  end,
  imports.access_scope,
  imports.published
from public.training_session_imports imports
where imports.batch_id = 'week-2026-22'
on conflict (source_key) do update
set program_slug = excluded.program_slug,
    session_date = excluded.session_date,
    difficulty = excluded.difficulty,
    title = excluded.title,
    body = excluded.body,
    tags = excluded.tags,
    access_scope = excluded.access_scope,
    published = excluded.published,
    updated_at = now();
```

Then associate imported sessions to groups:

```sql
insert into public.training_session_groups (training_session_id, group_id)
select sessions.id, groups.id
from public.training_session_imports imports
join public.training_sessions sessions on sessions.source_key = imports.source_key
join lateral unnest(string_to_array(coalesce(nullif(imports.group_slugs_csv, ''), ''), ',')) group_slug(raw_slug) on true
join public.content_groups groups on groups.slug = trim(group_slug.raw_slug)
where imports.batch_id = 'week-2026-22'
  and imports.access_scope = 'group'
on conflict do nothing;
```

## 7. Common Operations

Unpublish a batch:

```sql
update public.training_sessions sessions
set published = false
from public.training_session_imports imports
where imports.source_key = sessions.source_key
  and imports.batch_id = 'week-2026-22';
```

Remove one email from a group:

```sql
update public.group_email_invites invites
set status = 'revoked'
from public.content_groups groups
where groups.id = invites.group_id
  and groups.slug = 'Clientes_Body_Factory'
  and invites.email_normalized = lower('cliente1@gmail.com');
```

Move a client from one group to another:

```sql
update public.group_email_invites invites
set status = 'revoked'
from public.content_groups groups
where groups.id = invites.group_id
  and groups.slug = 'Premium_Nivel_Inicial'
  and invites.email_normalized = lower('cliente3@gmail.com');

insert into public.group_email_invites (group_id, email, note, status)
select id, 'cliente3@gmail.com', 'Moved to intermediate level', 'active'
from public.content_groups
where slug = 'Premium_Nivel_Intermedio'
on conflict (group_id, email_normalized) do update
set status = 'active',
    note = excluded.note;
```

## 8. Weekly Workflow

1. Prepare a CSV of the week's sessions.
2. Import it into `training_session_imports`.
3. Run the upsert SQL for that batch.
4. Run the group association SQL for that batch.
5. Keep `published = false` while drafting.
6. Set `published = true` when ready.
7. Test as admin and as a client email in each relevant group.

## 9. Practical Recommendation

Use:

- `Clientes_Body_Factory` for permanent in-person swimmers.
- `Free_Trial_15_Days` for campaign or manual trials.
- `Premium_Nivel_*` for level-based content.
- `Premium_Triatlon` for triathlon plans.
- `Premium_Oceanman5k` and `Premium_Oceanman10k` for race-specific plans.

This gives you fast weekly updates without touching the deployed website.
