-- Editor list-page stat cards in one round-trip per resource.
-- Replaces 3–4 parallel PostgREST exact head counts on CMS / inbox lists.

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
