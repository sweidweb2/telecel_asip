-- Newsletter signup: site toggle (off by default) + subscribers table.
-- Public inserts only via Server Action + service role; admins can read/delete.

alter table public.site_settings
  add column if not exists newsletter_signup_enabled boolean not null default false;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  consent boolean not null,
  source_page text,
  created_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_len_chk
    check (char_length(email) between 3 and 254),
  constraint newsletter_subscribers_consent_chk
    check (consent = true),
  constraint newsletter_subscribers_source_page_len_chk
    check (
      source_page is null
      or char_length(source_page) between 1 and 120
    )
);

create unique index if not exists newsletter_subscribers_email_uidx
  on public.newsletter_subscribers (lower(email));

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

grant select, delete on table public.newsletter_subscribers to authenticated;
grant select, insert, update, delete on table public.newsletter_subscribers to service_role;

create policy "Admins can read newsletter subscribers"
  on public.newsletter_subscribers
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can delete newsletter subscribers"
  on public.newsletter_subscribers
  for delete
  to authenticated
  using (public.is_admin());
