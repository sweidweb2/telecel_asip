-- Preserve the context in which a lightweight Register Interest lead consented.
-- These values are server-owned: clients cannot write to the table directly.

alter table public.interest_registrations
  add column locale text not null default 'en',
  add column source_path text not null default '/register-interest',
  add column consent_version text not null default '2026-09-17';

alter table public.interest_registrations
  add constraint interest_registrations_locale_chk
    check (locale in ('en', 'fr')),
  add constraint interest_registrations_source_path_chk
    check (source_path in ('/en/register-interest', '/fr/register-interest', '/register-interest')),
  add constraint interest_registrations_consent_version_len_chk
    check (char_length(consent_version) between 1 and 40);

comment on column public.interest_registrations.locale is
  'Locale of the live Register Interest page at submission time.';
comment on column public.interest_registrations.source_path is
  'Canonical public path that produced the lead.';
comment on column public.interest_registrations.consent_version is
  'Version/date of the consent wording accepted by the founder.';
