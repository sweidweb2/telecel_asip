-- At most one pending/processing backup at a time (closes check-then-insert race).
create unique index backups_one_in_flight_uidx
  on public.backups ((true))
  where status in ('pending', 'processing');
