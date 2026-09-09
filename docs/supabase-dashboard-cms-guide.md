# Best Swim CMS In Supabase Dashboard

This is the recommended content workflow if you do not want to edit website files for weekly updates.

The website should be deployed once. After that, weekly sessions, challenges and multimedia are managed in Supabase.

## Core Idea

Use Supabase as the CMS:

- `training_sessions`: weekly client sessions.
- `media_items`: drills, videos, PDFs and external links.
- `profiles`: user roles and access flags.
- `subscriptions`: Stripe subscription state.
- Supabase Storage: video/image/PDF files.

The localhost admin page is only a development helper. The production operating system should be Supabase Dashboard first, then a polished admin CMS later if needed.

## 1. Confirm Your Admin User

After logging in with Google once, run this in Supabase SQL Editor:

```sql
select id, email, role, access_tier, trial_ends_at, body_factory_student
from public.profiles
order by created_at desc;
```

For group-based access, also check:

```sql
select slug, group_type, active
from public.content_groups
order by slug;
```

Find your Google email. Then make it admin:

```sql
update public.profiles
set role = 'admin'
where email = 'YOUR_EMAIL@example.com';
```

Admin is not a paid membership. It is only your platform-management role.

If the client portal shows `permission denied for table training_sessions`, run:

```text
docs/supabase-api-grants-fix.sql
```

That gives the Supabase API roles access to the tables; RLS still decides which rows each user can read or write.

## 2. Create A Weekly Session

In Supabase Dashboard:

1. Go to Table Editor.
2. Open `training_sessions`.
3. Insert row.
4. Fill:

```text
program_slug: entrenamiento
session_date: 2026-05-31
difficulty: intermedio
published: true
```

JSON fields:

```json
{
  "es": "Sesión semanal AEM",
  "en": "Weekly AEM session",
  "pt": "Sessão semanal AEM"
}
```

For `body`:

```json
{
  "es": "Calentamiento, bloque principal, técnica y vuelta a la calma.",
  "en": "Warm-up, main set, technique and cool-down.",
  "pt": "Aquecimento, bloco principal, técnica e volta à calma."
}
```

For `tags`:

```text
{AEM,piscina,semana}
```

## 3. Publish Or Unpublish

Use the `published` field:

- `false`: draft, not visible.
- `true`: visible to users allowed by RLS.

## 4. Upload Videos / PDFs

Create these buckets in Supabase Storage:

```text
training-videos
training-thumbnails
documents
```

Suggested initial access:

- Keep buckets private.
- Use `media_items` rows to control which files should appear.
- Later add signed URL generation through server routes or Supabase Edge Functions.

## 5. Create Multimedia Metadata

After uploading a video, insert a row in `media_items`:

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

Access levels:

- `public`: visible to everyone.
- `free`: visible to Free Trial / Body Factory / admin.
- `premium`: visible to Premium subscribers / admin.

## 6. Client Access Model

This is the intended automation:

- New Google/Facebook/Apple user creates a row in `profiles`.
- Free Trial is calculated from `trial_ends_at` or assigned through `Free_Trial_15_Days`.
- Body Factory students are assigned in bulk through `Clientes_Body_Factory`.
- Premium is synced by Stripe webhook into `subscriptions`.
- Premium users can be segmented with `Premium_Nivel_Inicial`, `Premium_Nivel_Intermedio`, `Premium_Nivel_Intermedio_Avanzado`, `Premium_Nivel_Avanzado`, `Premium_Triatlon`, `Premium_Oceanman5k`, and `Premium_Oceanman10k`.
- Portal content is filtered by RLS.

## 7. Important Deployment Note

If Hostinger only receives static files, API routes and server-side Stripe webhooks will not run there.

For the full product, deploy the Next.js app to a Node-capable host such as:

- Vercel
- Hostinger VPS / Node.js hosting, if enabled
- Render / Railway / similar

The landing page can be static, but client portal + Stripe webhook + protected content need server/runtime support unless we redesign them as a fully client-side Supabase app plus separate webhook service.
