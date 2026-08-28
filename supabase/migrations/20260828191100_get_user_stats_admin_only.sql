-- Restrict the Users-page stats RPC to admins.
--
-- As SECURITY INVOKER the counts were already filtered by RLS, so a non-admin
-- caller got a misleading "total: 1" rather than another user's data. Failing
-- closed is clearer than returning numbers that silently mean something else.

create or replace function public.get_user_stats()
returns table (
  total bigint,
  admins bigint,
  editors bigint,
  viewers bigint,
  new_this_week bigint,
  new_this_month bigint
)
language plpgsql
stable
security invoker
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  return query
  select
    count(*)::bigint as total,
    count(*) filter (where p.role = 'admin')::bigint as admins,
    count(*) filter (where p.role = 'editor')::bigint as editors,
    count(*) filter (where p.role = 'viewer')::bigint as viewers,
    count(*) filter (
      where p.created_at >= date_trunc('week', timezone('utc', now()))
    )::bigint as new_this_week,
    count(*) filter (
      where p.created_at >= date_trunc('month', timezone('utc', now()))
    )::bigint as new_this_month
  from public.profiles p;
end;
$$;
