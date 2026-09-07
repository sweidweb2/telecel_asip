-- Admin backup audit log. Files live in private Cloudflare R2 (not Postgres).
-- Manual rows set user_id to the triggering admin; automated weekly jobs use null.
-- Admins CRUD via is_admin(); service_role used by cron export path.

create type public.backup_scope as enum (
  'full',
  'tables',
  'storage',
  'automated'
);

create type public.backup_status as enum (
  'pending',
  'processing',
  'completed',
  'failed'
);

create type public.backup_format as enum (
  'json',
  'csv',
  'sql',
  'zip'
);

create table public.backups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  scope public.backup_scope not null,
  format public.backup_format not null,
  target_tables text[] null,
  file_path text null,
  file_size bigint null,
  status public.backup_status not null default 'pending',
  error_message text null,
  created_at timestamptz not null default now(),
  constraint backups_file_path_len_chk check (
    file_path is null or char_length(file_path) between 1 and 1024
  ),
  constraint backups_file_size_nonneg_chk check (
    file_size is null or file_size >= 0
  ),
  constraint backups_error_message_len_chk check (
    error_message is null or char_length(error_message) <= 4000
  ),
  constraint backups_tables_scope_chk check (
    (scope = 'tables' and target_tables is not null and cardinality(target_tables) > 0)
    or (scope <> 'tables' and (target_tables is null or cardinality(target_tables) = 0))
  ),
  constraint backups_storage_format_chk check (
    (scope = 'storage' and format = 'zip')
    or (scope <> 'storage')
  )
);

create index backups_user_id_idx
  on public.backups (user_id);

create index backups_created_at_idx
  on public.backups (created_at desc);

create index backups_status_idx
  on public.backups (status);

create index backups_scope_created_at_idx
  on public.backups (scope, created_at desc);

alter table public.backups enable row level security;

grant select, insert, update, delete on table public.backups to authenticated;
grant select, insert, update, delete on table public.backups to service_role;

create policy "Admins can read backups"
  on public.backups
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert backups"
  on public.backups
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update backups"
  on public.backups
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete backups"
  on public.backups
  for delete
  to authenticated
  using (public.is_admin());
