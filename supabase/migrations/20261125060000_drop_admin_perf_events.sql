-- Teardown temporary admin performance tracker.
drop function if exists public.get_admin_perf_analytics(timestamptz);
drop table if exists public.admin_perf_events cascade;
