-- Investor intake mirrors founder Register Interest / Apply:
-- investor_interests = light lead; investor_engagements = deeper engagement.
-- Public writes via service role only. Staff triage via is_editor() RLS.

create type public.investor_kind as enum (
  'angel',
  'vc',
  'corporate',
  'dfi',
  'family_office',
  'other'
);

create type public.investor_stage as enum (
  'pre_seed',
  'seed',
  'series_a',
  'growth'
);

create type public.investor_ticket_size as enum (
  'under_50k',
  '50k_250k',
  '250k_1m',
  '1m_plus',
  'undisclosed'
);

create type public.investor_engagement_intent as enum (
  'portfolio_access',
  'introductions',
  'co_invest',
  'pilot_partnership',
  'mentorship',
  'other'
);

create type public.investor_timeline as enum (
  'exploring',
  'this_quarter',
  'this_year'
);

-- ---------------------------------------------------------------------------
-- 1. investor_interests (light lead — Register Interest path)
-- ---------------------------------------------------------------------------

create table public.investor_interests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  organization text not null,
  job_title text,
  linkedin text,
  investor_type public.investor_kind not null,
  focus_note text,
  consent boolean not null,
  comms_opt_in boolean not null default false,
  inbox_status public.inbox_status not null default 'unread',
  locale text not null default 'en',
  source_path text,
  consent_version text,
  created_at timestamptz not null default now(),
  constraint investor_interests_consent_true check (consent = true),
  constraint investor_interests_full_name_len_chk check (
    char_length(full_name) between 2 and 100
  ),
  constraint investor_interests_email_len_chk check (
    char_length(email) between 3 and 254
  ),
  constraint investor_interests_phone_len_chk check (
    phone is null or char_length(phone) between 7 and 20
  ),
  constraint investor_interests_organization_len_chk check (
    char_length(organization) between 2 and 120
  ),
  constraint investor_interests_job_title_len_chk check (
    job_title is null or char_length(job_title) between 2 and 80
  ),
  constraint investor_interests_linkedin_len_chk check (
    linkedin is null or char_length(linkedin) <= 500
  ),
  constraint investor_interests_linkedin_format_chk check (
    linkedin is null or linkedin ~* '^https?://.+'
  ),
  constraint investor_interests_focus_note_len_chk check (
    focus_note is null or char_length(focus_note) between 20 and 1000
  ),
  constraint investor_interests_locale_chk check (locale in ('en', 'fr')),
  constraint investor_interests_source_path_chk check (
    source_path is null or char_length(source_path) between 1 and 200
  ),
  constraint investor_interests_consent_version_len_chk check (
    consent_version is null or char_length(consent_version) between 1 and 40
  )
);

create index investor_interests_created_at_idx
  on public.investor_interests (created_at desc);

create index investor_interests_email_idx
  on public.investor_interests (email);

create unique index investor_interests_email_org_uidx
  on public.investor_interests (lower(email), lower(organization));

create index investor_interests_user_id_idx
  on public.investor_interests (user_id)
  where user_id is not null;

create unique index investor_interests_user_org_uidx
  on public.investor_interests (user_id, lower(organization))
  where user_id is not null;

create index investor_interests_inbox_status_created_at_idx
  on public.investor_interests (inbox_status, created_at desc);

alter table public.investor_interests enable row level security;

grant select, insert, update, delete on table public.investor_interests to service_role;
grant select, update, delete on table public.investor_interests to authenticated;

create policy "Editors can read investor interests"
  on public.investor_interests
  for select
  to authenticated
  using (public.is_editor());

create policy "Editors can update investor interests"
  on public.investor_interests
  for update
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

create policy "Editors can delete investor interests"
  on public.investor_interests
  for delete
  to authenticated
  using (public.is_editor());

-- ---------------------------------------------------------------------------
-- 2. investor_engagements (deeper form — Apply path)
-- ---------------------------------------------------------------------------

create table public.investor_engagements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  organization text not null,
  job_title text,
  linkedin text,
  investor_type public.investor_kind not null,
  stages public.investor_stage[] not null default '{}',
  ticket_size public.investor_ticket_size not null,
  sectors text[] not null default '{}',
  geographies text[] not null default '{}',
  engagement_intent public.investor_engagement_intent not null,
  thesis text not null,
  timeline public.investor_timeline,
  referred_by text,
  message text,
  consent boolean not null,
  comms_opt_in boolean not null default false,
  inbox_status public.inbox_status not null default 'unread',
  locale text not null default 'en',
  source_path text,
  consent_version text,
  created_at timestamptz not null default now(),
  constraint investor_engagements_consent_true check (consent = true),
  constraint investor_engagements_full_name_len_chk check (
    char_length(full_name) between 2 and 100
  ),
  constraint investor_engagements_email_len_chk check (
    char_length(email) between 3 and 254
  ),
  constraint investor_engagements_phone_len_chk check (
    phone is null or char_length(phone) between 7 and 20
  ),
  constraint investor_engagements_organization_len_chk check (
    char_length(organization) between 2 and 120
  ),
  constraint investor_engagements_job_title_len_chk check (
    job_title is null or char_length(job_title) between 2 and 80
  ),
  constraint investor_engagements_linkedin_len_chk check (
    linkedin is null or char_length(linkedin) <= 500
  ),
  constraint investor_engagements_linkedin_format_chk check (
    linkedin is null or linkedin ~* '^https?://.+'
  ),
  constraint investor_engagements_stages_len_chk check (
    cardinality(stages) between 1 and 4
  ),
  constraint investor_engagements_sectors_len_chk check (
    cardinality(sectors) between 1 and 12
  ),
  constraint investor_engagements_geographies_len_chk check (
    cardinality(geographies) between 1 and 20
  ),
  constraint investor_engagements_thesis_len_chk check (
    char_length(thesis) between 40 and 2000
  ),
  constraint investor_engagements_referred_by_len_chk check (
    referred_by is null or char_length(referred_by) between 2 and 120
  ),
  constraint investor_engagements_message_len_chk check (
    message is null or char_length(message) between 20 and 1000
  ),
  constraint investor_engagements_locale_chk check (locale in ('en', 'fr')),
  constraint investor_engagements_source_path_chk check (
    source_path is null or char_length(source_path) between 1 and 200
  ),
  constraint investor_engagements_consent_version_len_chk check (
    consent_version is null or char_length(consent_version) between 1 and 40
  )
);

create index investor_engagements_created_at_idx
  on public.investor_engagements (created_at desc);

create index investor_engagements_email_idx
  on public.investor_engagements (email);

create unique index investor_engagements_email_org_uidx
  on public.investor_engagements (lower(email), lower(organization));

create index investor_engagements_user_id_idx
  on public.investor_engagements (user_id)
  where user_id is not null;

create unique index investor_engagements_user_org_uidx
  on public.investor_engagements (user_id, lower(organization))
  where user_id is not null;

create index investor_engagements_inbox_status_created_at_idx
  on public.investor_engagements (inbox_status, created_at desc);

alter table public.investor_engagements enable row level security;

grant select, insert, update, delete on table public.investor_engagements to service_role;
grant select, update, delete on table public.investor_engagements to authenticated;

create policy "Editors can read investor engagements"
  on public.investor_engagements
  for select
  to authenticated
  using (public.is_editor());

create policy "Editors can update investor engagements"
  on public.investor_engagements
  for update
  to authenticated
  using (public.is_editor())
  with check (public.is_editor());

create policy "Editors can delete investor engagements"
  on public.investor_engagements
  for delete
  to authenticated
  using (public.is_editor());
