-- Retype country-reach RPC as a typed table so the client maps columns
-- instead of parsing jsonb. DROP required: return type cannot change via
-- CREATE OR REPLACE.

drop function if exists public.get_active_startup_country_reach();

create function public.get_active_startup_country_reach()
returns table (
  country_code text,
  founder_count integer
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    upper(btrim(s.country_code)) as country_code,
    count(*)::integer as founder_count
  from public.startups_public s
  where s.country_code is not null
    and btrim(s.country_code) <> ''
  group by upper(btrim(s.country_code))
  order by 1;
$$;

revoke all on function public.get_active_startup_country_reach() from public;
grant execute on function public.get_active_startup_country_reach() to anon, authenticated;
