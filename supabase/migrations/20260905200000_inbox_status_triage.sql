-- Inbox triage for Applications, Registrations (leads), and Contact messages.
-- States: unread (default for new) → reviewed → archived.

create type public.inbox_status as enum ('unread', 'reviewed', 'archived');

alter table public.applications
  add column inbox_status public.inbox_status not null default 'unread';

alter table public.interest_registrations
  add column inbox_status public.inbox_status not null default 'unread';

alter table public.contact_messages
  add column inbox_status public.inbox_status not null default 'unread';

-- Existing rows were already handled by admins; treat them as reviewed.
update public.applications set inbox_status = 'reviewed';
update public.interest_registrations set inbox_status = 'reviewed';
update public.contact_messages set inbox_status = 'reviewed';

create index applications_inbox_status_created_at_idx
  on public.applications (inbox_status, created_at desc);

create index interest_registrations_inbox_status_created_at_idx
  on public.interest_registrations (inbox_status, created_at desc);

create index contact_messages_inbox_status_created_at_idx
  on public.contact_messages (inbox_status, created_at desc);
