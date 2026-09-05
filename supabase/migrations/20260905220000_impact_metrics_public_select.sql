-- Phase 6: anonymous (and non-admin authenticated) can read verified
-- impact metrics only. Admins keep full SELECT via existing is_admin() policy.

grant select on table public.impact_metrics to anon;

create policy "Anyone can read verified impact metrics"
  on public.impact_metrics
  for select
  to anon, authenticated
  using (publish_status = 'verified');
