-- Events CMS content type (Section 16 / Phase 5).
-- Public SELECT: published rows only. Admins CRUD via is_admin().
-- event_startups links events ↔ startups (founders).
-- Reuses cms_publish_status from founder_stories migration.
-- cohort_events deferred (Phase 5 plan locked without cohort junction).

create type public.event_format as enum (
  'virtual',
  'in_person',
  'hybrid'
);
create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date not null,
  location text,
  format public.event_format,
  speakers text[] not null default '{}'::text[],
  assets text[] not null default '{}'::text[],
  outcomes text,
  publish_status public.cms_publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_name_len_chk check (
    char_length(name) between 2 and 200
  ),
  constraint events_location_len_chk check (
    location is null or char_length(location) between 1 and 200
  ),
  constraint events_outcomes_len_chk check (
    outcomes is null or char_length(outcomes) <= 5000
  )
);

create index events_publish_status_event_date_idx
  on public.events (publish_status, event_date desc);

create index events_event_date_idx
  on public.events (event_date desc);

create index events_created_at_idx
  on public.events (created_at desc);

create index events_name_trgm_idx
  on public.events using gin (name extensions.gin_trgm_ops);

create or replace function public.set_events_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
  before update on public.events
  for each row
  execute function public.set_events_updated_at();

alter table public.events enable row level security;

grant select on table public.events to anon, authenticated;
grant insert, update, delete on table public.events to authenticated;
grant select, insert, update, delete on table public.events to service_role;

create policy "Anyone can read published events"
  on public.events
  for select
  to anon, authenticated
  using (publish_status = 'published');

create policy "Admins can read all events"
  on public.events
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert events"
  on public.events
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update events"
  on public.events
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete events"
  on public.events
  for delete
  to authenticated
  using (public.is_admin());

-- Junction: events ↔ startups (founder participants).
create table public.event_startups (
  event_id uuid not null references public.events (id) on delete cascade,
  startup_id uuid not null references public.startups (id) on delete cascade,
  primary key (event_id, startup_id)
);

create index event_startups_startup_id_idx
  on public.event_startups (startup_id);

create index event_startups_event_id_idx
  on public.event_startups (event_id);

alter table public.event_startups enable row level security;

grant select on table public.event_startups to anon, authenticated;
grant insert, update, delete on table public.event_startups to authenticated;
grant select, insert, update, delete on table public.event_startups to service_role;

create policy "Anyone can read event_startups for published events"
  on public.event_startups
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.events e
      where e.id = event_id
        and e.publish_status = 'published'
    )
  );

create policy "Admins can read all event_startups"
  on public.event_startups
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert event_startups"
  on public.event_startups
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update event_startups"
  on public.event_startups
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete event_startups"
  on public.event_startups
  for delete
  to authenticated
  using (public.is_admin());
