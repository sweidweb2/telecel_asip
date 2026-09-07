-- Founder story CMS content (one story per startup).
-- Admins manage via session client; published rows are readable by anon.
-- Quote render permission is enforced in the app layer (Phase 6); drafts may keep pending quotes.

create type public.quote_permission_status as enum ('granted', 'pending', 'denied');

create type public.cms_publish_status as enum ('draft', 'published');

create table public.founder_stories (
  id uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups (id) on delete cascade,
  the_problem text not null,
  what_they_built text not null,
  the_asip_connection text not null,
  where_they_are_now text not null,
  founder_quote_text text,
  quote_attribution_name text,
  quote_attribution_title text,
  quote_date date,
  quote_permission_status public.quote_permission_status,
  publish_status public.cms_publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint founder_stories_the_problem_len_chk check (
    char_length(the_problem) between 2 and 4000
  ),
  constraint founder_stories_what_they_built_len_chk check (
    char_length(what_they_built) between 2 and 4000
  ),
  constraint founder_stories_the_asip_connection_len_chk check (
    char_length(the_asip_connection) between 2 and 4000
  ),
  constraint founder_stories_where_they_are_now_len_chk check (
    char_length(where_they_are_now) between 2 and 4000
  ),
  constraint founder_stories_quote_text_len_chk check (
    founder_quote_text is null or char_length(founder_quote_text) <= 2000
  ),
  constraint founder_stories_quote_attribution_name_len_chk check (
    quote_attribution_name is null
    or char_length(quote_attribution_name) between 2 and 120
  ),
  constraint founder_stories_quote_attribution_title_len_chk check (
    quote_attribution_title is null
    or char_length(quote_attribution_title) between 2 and 160
  ),
  constraint founder_stories_quote_block_chk check (
    founder_quote_text is null
    or btrim(founder_quote_text) = ''
    or (
      quote_attribution_name is not null
      and btrim(quote_attribution_name) <> ''
      and quote_permission_status is not null
    )
  )
);

create unique index founder_stories_startup_id_uidx
  on public.founder_stories (startup_id);

create index founder_stories_publish_status_updated_at_idx
  on public.founder_stories (publish_status, updated_at desc);

create or replace function public.set_founder_stories_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger founder_stories_set_updated_at
  before update on public.founder_stories
  for each row
  execute function public.set_founder_stories_updated_at();

alter table public.founder_stories enable row level security;

grant select on table public.founder_stories to anon, authenticated;
grant insert, update, delete on table public.founder_stories to authenticated;
grant select, insert, update, delete on table public.founder_stories to service_role;

create policy "Anyone can read published founder stories"
  on public.founder_stories
  for select
  to anon, authenticated
  using (publish_status = 'published');

create policy "Admins can read all founder stories"
  on public.founder_stories
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert founder stories"
  on public.founder_stories
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update founder stories"
  on public.founder_stories
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete founder stories"
  on public.founder_stories
  for delete
  to authenticated
  using (public.is_admin());
