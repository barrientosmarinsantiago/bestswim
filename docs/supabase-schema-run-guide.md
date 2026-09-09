# Best Swim Supabase Schema Run Guide

Use this guide when running `docs/supabase-schema.sql` in the Supabase SQL Editor.

## Important

Use **Run**, not **Analyze** or **Explain**.

The SQL file contains many statements. `Analyze/Explain` only works with one query and does not create the full schema. If you see this error, you are in the wrong action:

```text
EXPLAIN only works on a single SQL statement.
```

## Recommended Steps

1. Open Supabase Dashboard.
2. Go to **SQL Editor**.
3. Click **New query**.
4. Paste the full contents of `docs/supabase-schema.sql`, starting from line 1:

```sql
-- Best Swim production schema
```

5. Click **Run**.
6. Do not select only part of the SQL unless you are intentionally running one section.

## If You Already Got `public.challenges does not exist`

Run this quick check in a new SQL query:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'subscriptions',
    'programs',
    'challenges',
    'training_sessions',
    'leads'
  )
order by table_name;
```

Expected result:

```text
challenges
leads
profiles
programs
subscriptions
training_sessions
```

If `challenges` or other tables are missing, run the full `docs/supabase-schema.sql` again using **Run**.

## Safer Manual Recovery

If the full file still gives an error because only part of it was executed before, run these sections from `docs/supabase-schema.sql` in order:

1. Lines 4-68: extension and tables.
2. Lines 70-109: updated-at function and triggers.
3. Lines 111-177: auth/profile helper functions.
4. Lines 179-250: RLS and policies.

Always use **Run** for each section.

