-- Cohorts CMS content type + M2M junctions to partners and startups.
-- Public SELECT when publish_status = published; admins CRUD via is_admin().
-- Write RPCs keep cohort + junction sync atomic.
-- cms_publish_status may already exist (founder_stories / events); create only if missing.

create type public.cohort_programme_status as enum (
  'closed',
  'open',
  'hold'
);

do $$ begin
  create type public.cms_publish_status as enum (
    'draft',
    'published'
  );
exception
  when duplicate_object then null;
end $$;

create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  year integer not null,
  public_label text not null,
  programme_dates_start date,
  programme_dates_end date,
  programme_status public.cohort_programme_status not null,
  summary text,
  media_url text,
  publish_status public.cms_publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cohorts_year_chk check (
    year between 1900 and 2100
  ),
  constraint cohorts_public_label_len_chk check (
    char_length(public_label) between 2 and 160
  ),
  constraint cohorts_summary_len_chk check (
    summary is null or char_length(summary) <= 5000
  ),
  constraint cohorts_media_url_len_chk check (
    media_url is null or char_length(media_url) <= 500
  ),
  constraint cohorts_media_url_format_chk check (
    media_url is null or media_url ~* '^https?://.+'
  ),
  constraint cohorts_programme_dates_order_chk check (
    programme_dates_start is null
    or programme_dates_end is null
    or programme_dates_end >= programme_dates_start
  )
);

create unique index cohorts_year_public_label_uidx
  on public.cohorts (year, public_label);

create index cohorts_publish_status_year_idx
  on public.cohorts (publish_status, year desc);

create index cohorts_created_at_idx
  on public.cohorts (created_at desc);

create or replace function public.set_cohorts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cohorts_set_updated_at
  before update on public.cohorts
  for each row
  execute function public.set_cohorts_updated_at();

create table public.cohort_partners (
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  partner_id uuid not null references public.partners (id) on delete cascade,
  primary key (cohort_id, partner_id)
);

create index cohort_partners_partner_id_idx
  on public.cohort_partners (partner_id);

create table public.cohort_startups (
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  startup_id uuid not null references public.startups (id) on delete cascade,
  primary key (cohort_id, startup_id)
);

create index cohort_startups_startup_id_idx
  on public.cohort_startups (startup_id);

-- RLS: cohorts
alter table public.cohorts enable row level security;

grant select on table public.cohorts to anon, authenticated;
grant insert, update, delete on table public.cohorts to authenticated;
grant select, insert, update, delete on table public.cohorts to service_role;

create policy "Anyone can read published cohorts"
  on public.cohorts
  for select
  to anon, authenticated
  using (publish_status = 'published');

create policy "Admins can read all cohorts"
  on public.cohorts
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert cohorts"
  on public.cohorts
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update cohorts"
  on public.cohorts
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete cohorts"
  on public.cohorts
  for delete
  to authenticated
  using (public.is_admin());

-- RLS: cohort_partners
alter table public.cohort_partners enable row level security;

grant select on table public.cohort_partners to anon, authenticated;
grant insert, update, delete on table public.cohort_partners to authenticated;
grant select, insert, update, delete on table public.cohort_partners to service_role;

create policy "Anyone can read partners of published cohorts"
  on public.cohort_partners
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.cohorts c
      where c.id = cohort_id
        and c.publish_status = 'published'
    )
  );

create policy "Admins can read all cohort partners"
  on public.cohort_partners
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert cohort partners"
  on public.cohort_partners
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update cohort partners"
  on public.cohort_partners
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete cohort partners"
  on public.cohort_partners
  for delete
  to authenticated
  using (public.is_admin());

-- RLS: cohort_startups
alter table public.cohort_startups enable row level security;

grant select on table public.cohort_startups to anon, authenticated;
grant insert, update, delete on table public.cohort_startups to authenticated;
grant select, insert, update, delete on table public.cohort_startups to service_role;

create policy "Anyone can read startups of published cohorts"
  on public.cohort_startups
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.cohorts c
      where c.id = cohort_id
        and c.publish_status = 'published'
    )
  );

create policy "Admins can read all cohort startups"
  on public.cohort_startups
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert cohort startups"
  on public.cohort_startups
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update cohort startups"
  on public.cohort_startups
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete cohort startups"
  on public.cohort_startups
  for delete
  to authenticated
  using (public.is_admin());

-- Atomic admin create/update with junction replace.
create or replace function public.create_cohort_with_links(
  p_cohort jsonb,
  p_partner_ids uuid[] default '{}'::uuid[],
  p_startup_ids uuid[] default '{}'::uuid[]
)
returns table (
  id uuid
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  v_partner_id uuid;
  v_startup_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  insert into public.cohorts (
    year,
    public_label,
    programme_dates_start,
    programme_dates_end,
    programme_status,
    summary,
    media_url,
    publish_status
  )
  values (
    (p_cohort->>'year')::integer,
    p_cohort->>'public_label',
    nullif(p_cohort->>'programme_dates_start', '')::date,
    nullif(p_cohort->>'programme_dates_end', '')::date,
    (p_cohort->>'programme_status')::public.cohort_programme_status,
    nullif(p_cohort->>'summary', ''),
    nullif(p_cohort->>'media_url', ''),
    (p_cohort->>'publish_status')::public.cms_publish_status
  )
  returning cohorts.id into v_id;

  foreach v_partner_id in array coalesce(p_partner_ids, '{}'::uuid[])
  loop
    insert into public.cohort_partners (cohort_id, partner_id)
    values (v_id, v_partner_id);
  end loop;

  foreach v_startup_id in array coalesce(p_startup_ids, '{}'::uuid[])
  loop
    insert into public.cohort_startups (cohort_id, startup_id)
    values (v_id, v_startup_id);
  end loop;

  id := v_id;
  return next;
end;
$$;

create or replace function public.update_cohort_with_links(
  p_id uuid,
  p_cohort jsonb,
  p_partner_ids uuid[] default '{}'::uuid[],
  p_startup_ids uuid[] default '{}'::uuid[]
)
returns table (
  id uuid
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_exists uuid;
  v_partner_id uuid;
  v_startup_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  select c.id into v_exists
  from public.cohorts c
  where c.id = p_id
  for update;

  if v_exists is null then
    raise exception 'cohort not found'
      using errcode = 'P0002';
  end if;

  update public.cohorts c
  set
    year = (p_cohort->>'year')::integer,
    public_label = p_cohort->>'public_label',
    programme_dates_start = nullif(p_cohort->>'programme_dates_start', '')::date,
    programme_dates_end = nullif(p_cohort->>'programme_dates_end', '')::date,
    programme_status = (p_cohort->>'programme_status')::public.cohort_programme_status,
    summary = nullif(p_cohort->>'summary', ''),
    media_url = nullif(p_cohort->>'media_url', ''),
    publish_status = (p_cohort->>'publish_status')::public.cms_publish_status
  where c.id = p_id;

  delete from public.cohort_partners where cohort_id = p_id;
  delete from public.cohort_startups where cohort_id = p_id;

  foreach v_partner_id in array coalesce(p_partner_ids, '{}'::uuid[])
  loop
    insert into public.cohort_partners (cohort_id, partner_id)
    values (p_id, v_partner_id);
  end loop;

  foreach v_startup_id in array coalesce(p_startup_ids, '{}'::uuid[])
  loop
    insert into public.cohort_startups (cohort_id, startup_id)
    values (p_id, v_startup_id);
  end loop;

  id := p_id;
  return next;
end;
$$;

grant execute on function public.create_cohort_with_links(jsonb, uuid[], uuid[]) to authenticated;
grant execute on function public.update_cohort_with_links(uuid, jsonb, uuid[], uuid[]) to authenticated;
