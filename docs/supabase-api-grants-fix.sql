-- Best Swim Supabase Data API grants fix
-- Run this in Supabase SQL Editor if the portal shows:
-- "permission denied for table training_sessions"
--
-- RLS still controls row visibility. These GRANTs only allow the Supabase
-- anon/authenticated API roles to reach the tables so RLS can evaluate access.

grant usage on schema public to anon, authenticated, service_role;

grant select on public.programs to anon, authenticated;
grant select on public.challenges to anon, authenticated;

grant select, insert, update on public.profiles to authenticated;
grant select on public.subscriptions to authenticated;

grant select, insert, update, delete on public.training_sessions to authenticated;

grant select on public.media_items to anon;
grant select, insert, update, delete on public.media_items to authenticated;

grant insert on public.leads to anon, authenticated;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.current_profile_stripe_customer_id() to authenticated;
grant execute on function public.has_active_subscription() to authenticated;
grant execute on function public.has_portal_access() to authenticated;
