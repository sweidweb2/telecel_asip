-- Public settings without backup_time; staff-only base SELECT; staff UPDATE;
-- only admins may change backup_time.

create or replace view public.site_settings_public as
select
  id,
  open_applications,
  newsletter_signup_enabled
from public.site_settings;

comment on view public.site_settings_public is
  'Anonymous-readable site flags only. backup_time is never exposed.';

revoke select on table public.site_settings from anon;

drop policy if exists "Anyone can read site settings" on public.site_settings;

create policy "Staff can read site settings"
  on public.site_settings
  for select
  to authenticated
  using (public.is_staff());

-- Keep a single update path for staff; backup_time changes are admin-only via trigger.
drop policy if exists "Admins can update site settings" on public.site_settings;

create policy "Staff can update site settings"
  on public.site_settings
  for update
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

grant select on public.site_settings_public to anon, authenticated;

create or replace function public.protect_site_settings_backup_time()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.backup_time is distinct from old.backup_time
     and not public.is_admin() then
    raise exception 'Only administrators can change backup_time'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists site_settings_protect_backup_time on public.site_settings;

create trigger site_settings_protect_backup_time
  before update on public.site_settings
  for each row
  execute function public.protect_site_settings_backup_time();

comment on function public.protect_site_settings_backup_time() is
  'Blocks non-admin UPDATE of site_settings.backup_time.';
