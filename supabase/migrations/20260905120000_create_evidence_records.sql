-- Evidence Register (Section 16 governance layer).
-- Admin-only: no anon access. Impact metrics (Phase 2) will FK here.
-- Admins CRUD via is_admin().

create type public.evidence_status as enum (
  'verified',
  'pending',
  'outdated',
  'disputed',
  'not_for_publication'
);

create type public.evidence_permission as enum (
  'public',
  'internal_only',
  'partner_approval_required',
  'legal_review_required'
);

create table public.evidence_records (
  id uuid primary key default gen_random_uuid(),
  primary_source text not null,
  source_file_url text,
  measurement_period_start date not null,
  measurement_period_end date not null,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  status public.evidence_status not null default 'pending',
  last_verified_date date not null,
  permission public.evidence_permission not null,
  review_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint evidence_records_primary_source_len_chk check (
    char_length(primary_source) between 2 and 2000
  ),
  constraint evidence_records_source_file_url_len_chk check (
    source_file_url is null or char_length(source_file_url) <= 500
  ),
  constraint evidence_records_source_file_url_format_chk check (
    source_file_url is null or source_file_url ~* '^https?://.+'
  ),
  constraint evidence_records_period_range_chk check (
    measurement_period_end >= measurement_period_start
  )
);

create index evidence_records_created_at_idx
  on public.evidence_records (created_at desc);

create index evidence_records_status_idx
  on public.evidence_records (status);

create index evidence_records_owner_id_idx
  on public.evidence_records (owner_id);

create index evidence_records_primary_source_trgm_idx
  on public.evidence_records using gin (primary_source extensions.gin_trgm_ops);

create or replace function public.set_evidence_records_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger evidence_records_set_updated_at
  before update on public.evidence_records
  for each row
  execute function public.set_evidence_records_updated_at();

alter table public.evidence_records enable row level security;

grant select, insert, update, delete on table public.evidence_records to authenticated;
grant select, insert, update, delete on table public.evidence_records to service_role;

create policy "Admins can read evidence records"
  on public.evidence_records
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert evidence records"
  on public.evidence_records
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update evidence records"
  on public.evidence_records
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete evidence records"
  on public.evidence_records
  for delete
  to authenticated
  using (public.is_admin());
