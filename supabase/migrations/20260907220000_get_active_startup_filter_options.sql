-- Distinct filter options for the public founders list in one round trip.
-- Replaces selecting every startups_public row's cohort/country/sector and
-- uniquifying in JS (grows with portfolio size).
--
-- security invoker so the startups_public view / RLS surface still applies.

create or replace function public.get_active_startup_filter_options()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'cohorts',
    coalesce(
      (
        select jsonb_agg(value order by value)
        from (
          select distinct cohort as value
          from public.startups_public
          where cohort is not null
            and btrim(cohort) <> ''
        ) cohorts
      ),
      '[]'::jsonb
    ),
    'countries',
    coalesce(
      (
        select jsonb_agg(value order by value)
        from (
          select distinct country_code as value
          from public.startups_public
          where country_code is not null
            and btrim(country_code) <> ''
        ) countries
      ),
      '[]'::jsonb
    ),
    'sectors',
    coalesce(
      (
        select jsonb_agg(value order by value)
        from (
          select distinct sector as value
          from public.startups_public
          where sector is not null
            and btrim(sector) <> ''
        ) sectors
      ),
      '[]'::jsonb
    )
  );
$$;

revoke all on function public.get_active_startup_filter_options() from public;
grant execute on function public.get_active_startup_filter_options() to anon, authenticated;
