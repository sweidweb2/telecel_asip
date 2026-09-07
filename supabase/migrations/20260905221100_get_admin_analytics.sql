-- Single round-trip admin analytics snapshot (pipeline + content counts).
-- Replaces ~32 exact head-count PostgREST queries from the Analytics page.

create or replace function public.get_admin_analytics()
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  since_7 timestamptz := timezone('utc', now()) - interval '7 days';
  since_30 timestamptz := timezone('utc', now()) - interval '30 days';
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  select jsonb_build_object(
    'applications', (
      select jsonb_build_object(
        'total', count(*)::bigint,
        'unread', count(*) filter (where a.inbox_status = 'unread')::bigint,
        'reviewed', count(*) filter (where a.inbox_status = 'reviewed')::bigint,
        'archived', count(*) filter (where a.inbox_status = 'archived')::bigint,
        'last7Days', count(*) filter (where a.created_at >= since_7)::bigint,
        'last30Days', count(*) filter (where a.created_at >= since_30)::bigint
      )
      from public.applications a
    ),
    'registrations', (
      select jsonb_build_object(
        'total', count(*)::bigint,
        'unread', count(*) filter (where r.inbox_status = 'unread')::bigint,
        'reviewed', count(*) filter (where r.inbox_status = 'reviewed')::bigint,
        'archived', count(*) filter (where r.inbox_status = 'archived')::bigint,
        'last7Days', count(*) filter (where r.created_at >= since_7)::bigint,
        'last30Days', count(*) filter (where r.created_at >= since_30)::bigint
      )
      from public.interest_registrations r
    ),
    'contactMessages', (
      select jsonb_build_object(
        'total', count(*)::bigint,
        'unread', count(*) filter (where c.inbox_status = 'unread')::bigint,
        'reviewed', count(*) filter (where c.inbox_status = 'reviewed')::bigint,
        'archived', count(*) filter (where c.inbox_status = 'archived')::bigint,
        'last7Days', count(*) filter (where c.created_at >= since_7)::bigint,
        'last30Days', count(*) filter (where c.created_at >= since_30)::bigint
      )
      from public.contact_messages c
    ),
    'content', jsonb_build_object(
      'blogsPublished', (select count(*)::bigint from public.blogs where status = 'published'),
      'blogsDraft', (select count(*)::bigint from public.blogs where status = 'draft'),
      'startupsActive', (select count(*)::bigint from public.startups where status = 'active'),
      'startupsOther', (select count(*)::bigint from public.startups where status is distinct from 'active'),
      'partnersActive', (select count(*)::bigint from public.partners where is_active = true),
      'partnersHistorical', (select count(*)::bigint from public.partners where is_active = false),
      'cohortsPublished', (select count(*)::bigint from public.cohorts where publish_status = 'published'),
      'cohortsDraft', (select count(*)::bigint from public.cohorts where publish_status = 'draft'),
      'eventsPublished', (select count(*)::bigint from public.events where publish_status = 'published'),
      'eventsDraft', (select count(*)::bigint from public.events where publish_status = 'draft'),
      'storiesPublished', (select count(*)::bigint from public.founder_stories where publish_status = 'published'),
      'storiesDraft', (select count(*)::bigint from public.founder_stories where publish_status = 'draft'),
      'metricsVerified', (select count(*)::bigint from public.impact_metrics where publish_status = 'verified'),
      'metricsOther', (select count(*)::bigint from public.impact_metrics where publish_status is distinct from 'verified')
    )
  )
  into result;

  return result;
end;
$$;

grant execute on function public.get_admin_analytics() to authenticated;
