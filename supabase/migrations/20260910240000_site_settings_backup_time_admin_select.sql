-- Hide site_settings.backup_time from JWT clients; admins read via RPC.

revoke select on table public.site_settings from authenticated;

grant select (
  id,
  open_applications,
  newsletter_signup_enabled,
  updated_at
) on public.site_settings to authenticated;

-- UPDATE stays table-level; protect_site_settings_backup_time still blocks
-- non-admin schedule changes. SELECT of backup_time requires the RPC below.

create or replace function public.get_admin_backup_schedule()
returns public.backup_schedule
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_time public.backup_schedule;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can read backup_time'
      using errcode = '42501';
  end if;

  select backup_time
  into v_time
  from public.site_settings
  where id = 1;

  return v_time;
end;
$$;

comment on function public.get_admin_backup_schedule() is
  'Admin-only read of site_settings.backup_time (column not granted to authenticated).';

revoke all on function public.get_admin_backup_schedule() from public;
grant execute on function public.get_admin_backup_schedule() to authenticated;
