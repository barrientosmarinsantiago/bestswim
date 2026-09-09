-- Best Swim client performance metrics
-- Stores private pace and test measurements per authenticated client.

create table if not exists public.client_performance_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  metric_type text not null
    check (metric_type in ('pace_100m', 'test_200m', 'test_400m')),
  measured_at date not null,
  value_seconds integer not null check (value_seconds > 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, metric_type, measured_at)
);

create index if not exists client_performance_metrics_user_type_date_idx
on public.client_performance_metrics (user_id, metric_type, measured_at);

drop trigger if exists client_performance_metrics_touch_updated_at on public.client_performance_metrics;
create trigger client_performance_metrics_touch_updated_at
before update on public.client_performance_metrics
for each row execute function public.touch_updated_at();

alter table public.client_performance_metrics enable row level security;

grant select, insert, update, delete on public.client_performance_metrics to authenticated;
grant select, insert, update, delete on public.client_performance_metrics to service_role;

drop policy if exists "client_performance_metrics_select_own" on public.client_performance_metrics;
create policy "client_performance_metrics_select_own"
on public.client_performance_metrics for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "client_performance_metrics_insert_own" on public.client_performance_metrics;
create policy "client_performance_metrics_insert_own"
on public.client_performance_metrics for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "client_performance_metrics_update_own" on public.client_performance_metrics;
create policy "client_performance_metrics_update_own"
on public.client_performance_metrics for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "client_performance_metrics_delete_own" on public.client_performance_metrics;
create policy "client_performance_metrics_delete_own"
on public.client_performance_metrics for delete
to authenticated
using ((select auth.uid()) = user_id);
