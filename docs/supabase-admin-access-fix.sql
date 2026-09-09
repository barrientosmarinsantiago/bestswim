-- Best Swim admin access fix
-- Run this in Supabase SQL Editor if /admin/training says admin access is blocked
-- or if diagnostics show "permission denied for table profiles".

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update on public.profiles to authenticated;
grant select on public.subscriptions to authenticated;
grant select, insert, update, delete on public.training_sessions to authenticated;
grant select on public.content_groups to authenticated;
grant select on public.profile_content_groups to authenticated;
grant select on public.training_session_groups to authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_profile_stripe_customer_id() to authenticated;
grant execute on function public.has_active_subscription() to authenticated;
grant execute on function public.has_portal_access() to authenticated;

-- Replace this email with the Google account you use as platform admin.
update public.profiles
set role = 'admin',
    updated_at = now()
where lower(email) = lower('bestswim.info@gmail.com');

select email, role, updated_at
from public.profiles
where lower(email) = lower('bestswim.info@gmail.com');
