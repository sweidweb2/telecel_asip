-- Wire investor intake tables into editor sidebar badges, list-page stats,
-- and admin analytics. Mirrors founder applications / interest_registrations.

create or replace function public.get_dashboard_nav_counts()
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
begin
  if not public.is_editor() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  return jsonb_build_object(
    'interest_registrations', (select count(*)::bigint from public.interest_registrations),
    'applications', (select count(*)::bigint from public.applications),
    'investor_interests', (select count(*)::bigint from public.investor_interests),
    'investor_engagements', (select count(*)::bigint from public.investor_engagements),
    'contact_messages', (select count(*)::bigint from public.contact_messages),
    'newsletter_subscribers', (select count(*)::bigint from public.newsletter_subscribers),
    'blogs', (select count(*)::bigint from public.blogs),
    'startups', (select count(*)::bigint from public.startups),
    'partners', (select count(*)::bigint from public.partners),
    'founder_stories', (select count(*)::bigint from public.founder_stories),
    'cohorts', (select count(*)::bigint from public.cohorts),
    'events', (select count(*)::bigint from public.events),
    'evidence_records', (select count(*)::bigint from public.evidence_records),
    'impact_metrics', (select count(*)::bigint from public.impact_metrics),
    'profiles', (select count(*)::bigint from public.profiles)
  );
end;
$$;

comment on function public.get_dashboard_nav_counts() is
  'Editor sidebar record badges. One jsonb of table totals; RLS applies (editors skip admin profiles).';

grant execute on function public.get_dashboard_nav_counts() to authenticated;

-- ---------------------------------------------------------------------------

create or replace function public.get_admin_list_stats(p_resource text)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  since_7 timestamptz := timezone('utc', now()) - interval '7 days';
  today_utc date := (timezone('utc', now()))::date;
begin
  if not public.is_editor() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  case p_resource
    when 'blogs' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'published', count(*) filter (where status = 'published')::bigint,
          'draft', count(*) filter (where status = 'draft')::bigint,
          'featured', count(*) filter (where is_featured)::bigint
        )
        from public.blogs
      );
    when 'partners' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'active', count(*) filter (where is_active)::bigint,
          'historical', count(*) filter (where not is_active)::bigint,
          'logoGranted', count(*) filter (where logo_permission)::bigint
        )
        from public.partners
      );
    when 'startups' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'active', count(*) filter (where status = 'active')::bigint,
          'draft', count(*) filter (where status = 'draft')::bigint,
          'inactive', count(*) filter (where status = 'inactive')::bigint
        )
        from public.startups
      );
    when 'cohorts' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'published', count(*) filter (where publish_status = 'published')::bigint,
          'draft', count(*) filter (where publish_status = 'draft')::bigint,
          'open', count(*) filter (where programme_status = 'open')::bigint
        )
        from public.cohorts
      );
    when 'events' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'published', count(*) filter (where publish_status = 'published')::bigint,
          'draft', count(*) filter (where publish_status = 'draft')::bigint,
          'upcoming', count(*) filter (where event_date >= today_utc)::bigint
        )
        from public.events
      );
    when 'founder_stories' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'published', count(*) filter (where publish_status = 'published')::bigint,
          'draft', count(*) filter (where publish_status = 'draft')::bigint,
          'quotePending', count(*) filter (where quote_permission_status = 'pending')::bigint
        )
        from public.founder_stories
      );
    when 'evidence_records' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'verified', count(*) filter (where status = 'verified')::bigint,
          'pending', count(*) filter (where status = 'pending')::bigint,
          'attention', count(*) filter (where status in ('outdated', 'disputed'))::bigint
        )
        from public.evidence_records
      );
    when 'impact_metrics' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'verified', count(*) filter (where publish_status = 'verified')::bigint,
          'pending', count(*) filter (where publish_status = 'pending')::bigint,
          'notForPublication', count(*) filter (where publish_status = 'not_for_publication')::bigint
        )
        from public.impact_metrics
      );
    when 'applications' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'unread', count(*) filter (where inbox_status = 'unread')::bigint,
          'reviewed', count(*) filter (where inbox_status = 'reviewed')::bigint,
          'last7Days', count(*) filter (where created_at >= since_7)::bigint
        )
        from public.applications
      );
    when 'interest_registrations' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'unread', count(*) filter (where inbox_status = 'unread')::bigint,
          'reviewed', count(*) filter (where inbox_status = 'reviewed')::bigint,
          'last7Days', count(*) filter (where created_at >= since_7)::bigint
        )
        from public.interest_registrations
      );
    when 'investor_interests' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'unread', count(*) filter (where inbox_status = 'unread')::bigint,
          'reviewed', count(*) filter (where inbox_status = 'reviewed')::bigint,
          'last7Days', count(*) filter (where created_at >= since_7)::bigint
        )
        from public.investor_interests
      );
    when 'investor_engagements' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'unread', count(*) filter (where inbox_status = 'unread')::bigint,
          'reviewed', count(*) filter (where inbox_status = 'reviewed')::bigint,
          'last7Days', count(*) filter (where created_at >= since_7)::bigint
        )
        from public.investor_engagements
      );
    when 'contact_messages' then
      return (
        select jsonb_build_object(
          'total', count(*)::bigint,
          'unread', count(*) filter (where inbox_status = 'unread')::bigint,
          'reviewed', count(*) filter (where inbox_status = 'reviewed')::bigint,
          'last7Days', count(*) filter (where created_at >= since_7)::bigint
        )
        from public.contact_messages
      );
    else
      raise exception 'unknown resource'
        using errcode = '22023';
  end case;
end;
$$;

comment on function public.get_admin_list_stats(text) is
  'Editor list-page stat cards. One jsonb of filtered counts per resource; RLS applies.';

grant execute on function public.get_admin_list_stats(text) to authenticated;

-- ---------------------------------------------------------------------------

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
    'investorInterests', (
      select jsonb_build_object(
        'total', count(*)::bigint,
        'unread', count(*) filter (where i.inbox_status = 'unread')::bigint,
        'reviewed', count(*) filter (where i.inbox_status = 'reviewed')::bigint,
        'archived', count(*) filter (where i.inbox_status = 'archived')::bigint,
        'last7Days', count(*) filter (where i.created_at >= since_7)::bigint,
        'last30Days', count(*) filter (where i.created_at >= since_30)::bigint
      )
      from public.investor_interests i
    ),
    'investorEngagements', (
      select jsonb_build_object(
        'total', count(*)::bigint,
        'unread', count(*) filter (where e.inbox_status = 'unread')::bigint,
        'reviewed', count(*) filter (where e.inbox_status = 'reviewed')::bigint,
        'archived', count(*) filter (where e.inbox_status = 'archived')::bigint,
        'last7Days', count(*) filter (where e.created_at >= since_7)::bigint,
        'last30Days', count(*) filter (where e.created_at >= since_30)::bigint
      )
      from public.investor_engagements e
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
