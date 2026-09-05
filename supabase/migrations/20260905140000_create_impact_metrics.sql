-- Impact metrics (CMS Phase 2). Every metric links to one evidence_records row.
-- Admin-only until Phase 6 public wiring. Admins CRUD via is_admin().

create type public.impact_lens as enum (
  'pipeline',
  'inclusion',
  'business_growth',
  'commercialisation',
  'jobs_capability',
  'sector_outcomes'
);

create table public.impact_metrics (
  id uuid primary key default gen_random_uuid(),
  claim_label text not null,
  value text not null,
  unit text,
  period_start date not null,
  period_end date not null,
  geography text,
  impact_lens public.impact_lens,
  display_locations text[],
  evidence_id uuid not null references public.evidence_records (id) on delete restrict,
  publish_status public.evidence_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint impact_metrics_claim_label_len_chk check (
    char_length(claim_label) between 2 and 200
  ),
  constraint impact_metrics_value_len_chk check (
    char_length(value) between 1 and 80
  ),
  constraint impact_metrics_unit_len_chk check (
    unit is null or char_length(unit) between 1 and 40
  ),
  constraint impact_metrics_geography_len_chk check (
    geography is null or char_length(geography) between 2 and 120
  ),
  constraint impact_metrics_period_range_chk check (
    period_end >= period_start
  )
);

create index impact_metrics_publish_lens_idx
  on public.impact_metrics (publish_status, impact_lens);

create index impact_metrics_created_at_idx
  on public.impact_metrics (created_at desc);

create index impact_metrics_evidence_id_idx
  on public.impact_metrics (evidence_id);

create index impact_metrics_claim_label_trgm_idx
  on public.impact_metrics using gin (claim_label extensions.gin_trgm_ops);

create or replace function public.set_impact_metrics_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger impact_metrics_set_updated_at
  before update on public.impact_metrics
  for each row
  execute function public.set_impact_metrics_updated_at();

alter table public.impact_metrics enable row level security;

grant select, insert, update, delete on table public.impact_metrics to authenticated;
grant select, insert, update, delete on table public.impact_metrics to service_role;

create policy "Admins can read impact metrics"
  on public.impact_metrics
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert impact metrics"
  on public.impact_metrics
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update impact metrics"
  on public.impact_metrics
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete impact metrics"
  on public.impact_metrics
  for delete
  to authenticated
  using (public.is_admin());
