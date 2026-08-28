-- Enquiry routing for the public contact form.
-- Lets the ASIP team direct each submission to the owning function
-- (founder / partner / media), with 'general' as the catch-all.

create type public.contact_enquiry_type as enum (
  'founder',
  'partner',
  'media',
  'general'
);

alter table public.contact_messages
  add column enquiry_type public.contact_enquiry_type not null default 'general';

create index contact_messages_enquiry_type_idx
  on public.contact_messages (enquiry_type, created_at desc);
