-- Performance page aggregates in SQL instead of pulling rows into Node.
-- Admin-only, same gate as admin_perf_events RLS.

create or replace function public.get_admin_perf_analytics(p_since timestamptz)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  with windowed as (
    select event_type, name, duration_ms, cache_status, created_at
    from public.admin_perf_events
    where created_at >= p_since
  ),
  totals as (
    select
      count(*)::int as total,
      count(*) filter (where cache_status in ('hit', 'miss'))::int as cacheable,
      count(*) filter (where cache_status = 'hit')::int as hits
    from windowed
  ),
  by_type as (
    select event_type, count(*)::int as count
    from windowed
    group by event_type
  ),
  by_name as (
    select
      name,
      count(*)::int as count,
      round(avg(duration_ms)::numeric, 2) as avg_ms,
      round(
        (percentile_cont(0.95) within group (order by duration_ms))::numeric,
        2
      ) as p95_ms,
      count(*) filter (where cache_status = 'hit')::int as hit_count,
      count(*) filter (where cache_status in ('miss', 'n_a'))::int as miss_count,
      round(
        coalesce(avg(duration_ms) filter (where cache_status = 'hit'), 0)::numeric,
        2
      ) as hit_avg_ms,
      round(
        coalesce(
          avg(duration_ms) filter (where cache_status in ('miss', 'n_a')),
          0
        )::numeric,
        2
      ) as miss_avg_ms
    from windowed
    group by name
  ),
  slowest as (
    select *
    from by_name
    order by miss_avg_ms desc, avg_ms desc, name asc
    limit 12
  ),
  over_time as (
    select
      to_char(
        date_trunc('hour', created_at at time zone 'utc'),
        'YYYY-MM-DD"T"HH24:00'
      ) as bucket,
      count(*)::int as count,
      count(*) filter (where cache_status = 'hit')::int as hit,
      count(*) filter (where cache_status in ('miss', 'n_a'))::int as miss
    from windowed
    group by 1
  )
  select jsonb_build_object(
    'total', coalesce((select total from totals), 0),
    'hitRatio', coalesce((
      select case
        when cacheable = 0 then 0
        else round(hits::numeric / cacheable, 3)
      end
      from totals
    ), 0),
    'byEventType', coalesce((
      select jsonb_agg(
        jsonb_build_object('eventType', event_type, 'count', count)
        order by count desc, event_type asc
      )
      from by_type
    ), '[]'::jsonb),
    'slowest', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'name', name,
          'count', count,
          'avgMs', avg_ms,
          'p95Ms', p95_ms,
          'hitCount', hit_count,
          'missCount', miss_count,
          'hitAvgMs', hit_avg_ms,
          'missAvgMs', miss_avg_ms
        )
        order by miss_avg_ms desc, avg_ms desc, name asc
      )
      from slowest
    ), '[]'::jsonb),
    'overTime', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'bucket', bucket,
          'count', count,
          'hit', hit,
          'miss', miss
        )
        order by bucket asc
      )
      from over_time
    ), '[]'::jsonb)
  )
  into result;

  return result;
end;
$$;

comment on function public.get_admin_perf_analytics(timestamptz) is
  'Admin Performance page. Counts, p95, and hourly buckets for events since p_since. RLS applies.';

grant execute on function public.get_admin_perf_analytics(timestamptz) to authenticated;
