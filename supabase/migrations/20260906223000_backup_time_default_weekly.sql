-- Default automated backup cadence: weekly Sunday 03:00 Asia/Beirut.

alter table public.site_settings
  alter column backup_time set default 'weekly_sun_03'::public.backup_schedule;

update public.site_settings
set backup_time = 'weekly_sun_03'
where id = 1
  and backup_time = 'off';
