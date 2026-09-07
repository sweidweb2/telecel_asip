-- Extend interest_registrations (Leads) for Register Interest shared fields.
-- Existing rows get safe defaults; pitch becomes optional (legacy rows keep values).

alter table public.interest_registrations
  add column if not exists founder_role text,
  add column if not exists linkedin text,
  add column if not exists website text,
  add column if not exists company_country text,
  add column if not exists comms_opt_in boolean not null default false;

-- Backfill company_country from founder country where missing.
update public.interest_registrations
set company_country = country
where company_country is null;

alter table public.interest_registrations
  alter column company_country set not null;

-- Pitch is optional for new lightweight leads (legacy rows keep text).
alter table public.interest_registrations
  alter column pitch drop not null;

alter table public.interest_registrations
  drop constraint if exists interest_registrations_pitch_len_chk;

alter table public.interest_registrations
  add constraint interest_registrations_pitch_len_chk check (
    pitch is null or char_length(pitch) between 20 and 1000
  );

alter table public.interest_registrations
  add constraint interest_registrations_founder_role_len_chk check (
    founder_role is null or char_length(founder_role) between 2 and 80
  ),
  add constraint interest_registrations_linkedin_len_chk check (
    linkedin is null or char_length(linkedin) <= 500
  ),
  add constraint interest_registrations_linkedin_format_chk check (
    linkedin is null or linkedin ~* '^https?://.+'
  ),
  add constraint interest_registrations_website_len_chk check (
    website is null or char_length(website) <= 500
  ),
  add constraint interest_registrations_website_format_chk check (
    website is null or website ~* '^https?://.+'
  ),
  add constraint interest_registrations_company_country_len_chk check (
    char_length(company_country) between 2 and 80
  );
