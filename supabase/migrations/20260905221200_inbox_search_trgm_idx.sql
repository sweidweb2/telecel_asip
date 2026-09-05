-- Speed up admin ILIKE search on inbox pipeline tables (same pattern as partners/startups).

create index if not exists contact_messages_full_name_trgm_idx
  on public.contact_messages using gin (full_name extensions.gin_trgm_ops);

create index if not exists contact_messages_email_trgm_idx
  on public.contact_messages using gin (email extensions.gin_trgm_ops);

create index if not exists contact_messages_subject_trgm_idx
  on public.contact_messages using gin (subject extensions.gin_trgm_ops);

create index if not exists applications_full_name_trgm_idx
  on public.applications using gin (full_name extensions.gin_trgm_ops);

create index if not exists applications_email_trgm_idx
  on public.applications using gin (email extensions.gin_trgm_ops);

create index if not exists applications_company_name_trgm_idx
  on public.applications using gin (company_name extensions.gin_trgm_ops);

create index if not exists interest_registrations_full_name_trgm_idx
  on public.interest_registrations using gin (full_name extensions.gin_trgm_ops);

create index if not exists interest_registrations_email_trgm_idx
  on public.interest_registrations using gin (email extensions.gin_trgm_ops);

create index if not exists interest_registrations_company_name_trgm_idx
  on public.interest_registrations using gin (company_name extensions.gin_trgm_ops);
