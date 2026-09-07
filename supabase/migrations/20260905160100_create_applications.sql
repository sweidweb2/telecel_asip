-- Applications intake (Apply form). Separate from interest_registrations (Leads).
-- No automatic lead → application conversion. Public writes via service role only.

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  founder_role text not null,
  email text not null,
  phone text not null,
  country text not null,
  linkedin text not null,
  company_name text not null,
  website text not null,
  company_country text not null,
  sector text not null,
  problem_product text not null,
  traction text not null,
  programme_fit text not null,
  consent boolean not null,
  comms_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  constraint applications_consent_true check (consent = true),
  constraint applications_full_name_len_chk check (
    char_length(full_name) between 2 and 100
  ),
  constraint applications_founder_role_len_chk check (
    char_length(founder_role) between 2 and 80
  ),
  constraint applications_email_len_chk check (
    char_length(email) between 3 and 254
  ),
  constraint applications_phone_len_chk check (
    char_length(phone) between 7 and 20
  ),
  constraint applications_country_len_chk check (
    char_length(country) between 2 and 80
  ),
  constraint applications_linkedin_len_chk check (
    char_length(linkedin) between 8 and 500
  ),
  constraint applications_linkedin_format_chk check (
    linkedin ~* '^https?://.+'
  ),
  constraint applications_company_name_len_chk check (
    char_length(company_name) between 2 and 120
  ),
  constraint applications_website_len_chk check (
    char_length(website) between 8 and 500
  ),
  constraint applications_website_format_chk check (
    website ~* '^https?://.+'
  ),
  constraint applications_company_country_len_chk check (
    char_length(company_country) between 2 and 80
  ),
  constraint applications_sector_len_chk check (
    char_length(sector) between 2 and 80
  ),
  constraint applications_problem_product_len_chk check (
    char_length(problem_product) between 40 and 4000
  ),
  constraint applications_traction_len_chk check (
    char_length(traction) between 20 and 2000
  ),
  constraint applications_programme_fit_len_chk check (
    char_length(programme_fit) between 20 and 2000
  )
);

create index applications_created_at_idx
  on public.applications (created_at desc);

create index applications_email_idx
  on public.applications (email);

create unique index applications_email_company_uidx
  on public.applications (lower(email), lower(company_name));

alter table public.applications enable row level security;

grant select, insert on table public.applications to service_role;
grant select, update, delete on table public.applications to authenticated;
grant update, delete on table public.applications to service_role;

create policy "Admins can read applications"
  on public.applications
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update applications"
  on public.applications
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete applications"
  on public.applications
  for delete
  to authenticated
  using (public.is_admin());
