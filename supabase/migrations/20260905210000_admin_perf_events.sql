-- Temporary admin performance debug events (remove after CMS perf work).
-- Admin-only: insert/select/delete gated by is_admin().

create table public.admin_perf_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request_id text not null,
  parent_id uuid null references public.admin_perf_events (id) on delete set null,
  event_type text not null
    check (
      event_type in (
        'layout',
        'page',
        'action',
        'data_read',
        'option_load',
        'mutation',
        'upload'
      )
    ),
  name text not null,
  route text null,
  duration_ms double precision not null check (duration_ms >= 0),
  db_ms double precision null check (db_ms is null or db_ms >= 0),
  cache_status text not null
    check (cache_status in ('hit', 'miss', 'bypass', 'n_a')),
  ok boolean not null default true,
  error_message text null,
  meta jsonb not null default '{}'::jsonb
);

create index admin_perf_events_created_at_idx
  on public.admin_perf_events (created_at desc);

create index admin_perf_events_name_created_at_idx
  on public.admin_perf_events (name, created_at desc);

create index admin_perf_events_cache_status_created_at_idx
  on public.admin_perf_events (cache_status, created_at desc);

create index admin_perf_events_request_id_idx
  on public.admin_perf_events (request_id);

create index admin_perf_events_event_type_created_at_idx
  on public.admin_perf_events (event_type, created_at desc);

alter table public.admin_perf_events enable row level security;

grant select, insert, delete on table public.admin_perf_events to authenticated;
grant all on table public.admin_perf_events to service_role;

create policy "Admins can select admin_perf_events"
  on public.admin_perf_events for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert admin_perf_events"
  on public.admin_perf_events for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can delete admin_perf_events"
  on public.admin_perf_events for delete
  to authenticated
  using (public.is_admin());
