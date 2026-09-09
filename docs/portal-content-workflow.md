# Best Swim Portal Content Workflow

This is the operating model for publishing weekly training content, challenges and multimedia in Supabase.

Recommended operating model: manage weekly content in Supabase Dashboard first. The local `/admin/training` page is only a development helper until we build a polished production CMS.

For a dashboard-first guide, see:

```text
docs/supabase-dashboard-cms-guide.md
```

## 1. Run The Access Migration

After the base schema is installed, run:

```text
docs/supabase-portal-access-migration.sql
```

This adds:

- 15-day Free Trial access.
- Permanent Body Factory access flag.
- Premium access logic.
- Group-based access can be added with `docs/supabase-group-access-migration.sql`.
- Protected multimedia table.
- RLS policies for portal content.

## 2. Make Your User Admin

`admin` is not a client membership. It is the platform-management role that lets you create, edit and publish content.

Client access should be automatic later:

- Free Trial: created from profile dates or `Free_Trial_15_Days` group.
- Body Factory: `Clientes_Body_Factory` group for bulk email access.
- Premium: synced from Stripe subscriptions, then optionally segmented with Premium groups.

After signing in once with Google, go to Supabase SQL Editor and run:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_GOOGLE_EMAIL@example.com';
```

You do not need to set yourself as Premium to manage the platform. Admin access bypasses content restrictions for management and testing.

Then open:

```text
http://localhost:3000/es/admin/training
```

## 3. Weekly Training Sessions

The admin dashboard writes to `public.training_sessions`.

Required fields:

- `program_slug`: for example `entrenamiento`, `tecnica`, `aguas-abiertas-triatlon`.
- `session_date`: the date clients should see the session.
- `difficulty`: beginner, intermediate, advanced or your own naming.
- `title`: multilingual JSON.
- `body`: multilingual JSON.
- `tags`: optional array.
- `published`: controls visibility.

Manual SQL example:

```sql
insert into public.training_sessions (
  program_slug,
  session_date,
  difficulty,
  title,
  body,
  tags,
  published
) values (
  'entrenamiento',
  current_date,
  'intermedio',
  '{"es":"Sesión semanal AEM","en":"Weekly AEM session","pt":"Sessão semanal AEM"}',
  '{"es":"Calentamiento, bloque principal y vuelta a la calma.","en":"Warm-up, main set and cool-down.","pt":"Aquecimento, bloco principal e volta à calma."}',
  array['AEM','piscina','semana'],
  true
);
```

The portal currently reads the next published sessions from this table automatically.

## 4. Multimedia

Use Supabase Storage for files:

Recommended buckets:

- `training-videos`
- `training-thumbnails`
- `documents`

Recommended video workflow:

1. Compress the source video before upload.
2. Upload video to `training-videos`.
3. Upload thumbnail to `training-thumbnails`.
4. Create a row in `public.media_items`.

Example:

```sql
insert into public.media_items (
  slug,
  title,
  description,
  media_type,
  storage_path,
  thumbnail_path,
  program_slug,
  tags,
  access_level,
  published
) values (
  'drill-crol-codo-alto-01',
  '{"es":"Drill codo alto","en":"High-elbow drill","pt":"Drill cotovelo alto"}',
  '{"es":"Ejercicio técnico para mejorar agarre y recobro.","en":"Technical drill to improve catch and recovery.","pt":"Exercício técnico para melhorar agarre e recuperação."}',
  'video',
  'training-videos/drill-crol-codo-alto-01.mp4',
  'training-thumbnails/drill-crol-codo-alto-01.webp',
  'multimedia',
  array['crol','tecnica'],
  'free',
  true
);
```

## 5. Access Rules

Anonymous visitors:

- Marketing landing only.
- No protected portal content.

Free Trial:

- 15 days from first profile creation.
- Can read published `training_sessions`.
- Can read `media_items` with `access_level = 'free'`.

Body Factory students:

- Permanent access can be managed in bulk through `Clientes_Body_Factory`.
- Import emails into `group_email_imports`, then sync them into `group_email_invites`.
- Legacy/manual fallback:

```sql
update public.profiles
set body_factory_student = true
where email = 'student@example.com';
```

Premium:

- Stripe active/trialing subscription.
- Can read protected training sessions.
- Can read premium multimedia.

Admin:

- Can create, edit and publish.

## 6. Weekly Operating Routine

Every week:

1. Prepare 3-4 training sessions.
2. Upload related videos/thumbnails to Supabase Storage.
3. Create or update `training_sessions`.
4. Create related `media_items`.
5. Set `published = false` while drafting.
6. Set `published = true` when ready.
7. Test with:
   - Admin user.
   - Free trial user.
   - Premium user.
   - Anonymous visitor.

## 7. Automation Path

Recommended next development steps:

1. Add a full admin CMS for editing existing sessions.
2. Add media upload controls to the admin dashboard.
3. Add program filters in the client portal.
4. Add weekly schedule/calendar view.
5. Add Stripe webhook mapping to set Premium access automatically.
6. Add a Body Factory student flag in the admin dashboard.
