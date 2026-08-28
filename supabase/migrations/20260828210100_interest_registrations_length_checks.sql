-- Defense-in-depth length bounds aligned with validations/interest-registration.ts,
-- mirroring contact_messages. Writes reach this table through a service-role
-- Server Action, so Zod is currently the only bound on stored size.

alter table public.interest_registrations
  add constraint interest_registrations_full_name_len_chk
    check (char_length(full_name) between 2 and 100),
  add constraint interest_registrations_email_len_chk
    check (char_length(email) between 3 and 254),
  add constraint interest_registrations_phone_len_chk
    check (char_length(phone) between 7 and 20),
  add constraint interest_registrations_company_name_len_chk
    check (char_length(company_name) between 2 and 120),
  add constraint interest_registrations_sector_len_chk
    check (char_length(sector) between 2 and 80),
  add constraint interest_registrations_country_len_chk
    check (char_length(country) between 2 and 80),
  add constraint interest_registrations_pitch_len_chk
    check (char_length(pitch) between 20 and 1000);
