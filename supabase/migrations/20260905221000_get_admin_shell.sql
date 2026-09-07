-- One-shot dashboard shell: is_admin + profile fields for auth.uid().
-- Replaces separate is_admin() + profiles select (+ auth.getUser) on layout.

create or replace function public.get_admin_shell()
returns table (
  is_admin boolean,
  full_name text,
  email text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    public.is_admin() as is_admin,
    p.full_name,
    p.email
  from (select auth.uid() as uid) u
  left join public.profiles p on p.id = u.uid;
$$;

grant execute on function public.get_admin_shell() to authenticated;
