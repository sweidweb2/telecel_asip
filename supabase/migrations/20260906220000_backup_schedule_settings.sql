-- Scheduled backup cadence (Lebanon / Asia/Beirut times encoded in enum labels).
-- `now` is a UI action only — never stored.

create type public.backup_schedule as enum (
  'off',
  'daily_00',
  'daily_03',
  'daily_06',
  'daily_12',
  'daily_18',
  'weekly_sun_03',
  'weekly_mon_03'
);

alter table public.site_settings
  add column if not exists backup_time public.backup_schedule not null default 'off';

alter table public.backups
  add column if not exists schedule_window text null;

alter table public.backups
  drop constraint if exists backups_schedule_window_len_chk;

alter table public.backups
  add constraint backups_schedule_window_len_chk check (
    schedule_window is null or char_length(schedule_window) between 1 and 128
  );

create index if not exists backups_scope_schedule_window_idx
  on public.backups (scope, schedule_window);
