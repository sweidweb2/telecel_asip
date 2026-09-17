-- Editor sidebar badge totals in one round-trip (replaces 13 exact head counts).
-- Invoker so RLS applies: editors omit administrator profiles on Users.

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
