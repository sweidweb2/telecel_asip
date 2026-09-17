-- Country founder counts for the home footprint graphic in one round trip.
-- Replaces selecting every startups_public.country_code and aggregating in JS.
--
-- security invoker so the startups_public view / RLS surface still applies.

create or replace function public.get_active_startup_country_reach()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'countryCode', upper(btrim(country_code)),
          'founderCount', founder_count
        )
        order by upper(btrim(country_code))
      )
      from (
        select
          country_code,
          count(*)::int as founder_count
        from public.startups_public
        where country_code is not null
          and btrim(country_code) <> ''
        group by country_code
      ) reach
    ),
    '[]'::jsonb
  );
$$;

revoke all on function public.get_active_startup_country_reach() from public;
grant execute on function public.get_active_startup_country_reach() to anon, authenticated;
