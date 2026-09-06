-- Make applications LinkedIn + website optional (align with Register Interest).

alter table public.applications
  alter column linkedin drop not null,
  alter column website drop not null;

alter table public.applications
  drop constraint if exists applications_linkedin_len_chk,
  drop constraint if exists applications_linkedin_format_chk,
  drop constraint if exists applications_website_len_chk,
  drop constraint if exists applications_website_format_chk;

alter table public.applications
  add constraint applications_linkedin_len_chk check (
    linkedin is null or char_length(linkedin) <= 500
  ),
  add constraint applications_linkedin_format_chk check (
    linkedin is null or linkedin ~* '^https?://.+'
  ),
  add constraint applications_website_len_chk check (
    website is null or char_length(website) <= 500
  ),
  add constraint applications_website_format_chk check (
    website is null or website ~* '^https?://.+'
  );
