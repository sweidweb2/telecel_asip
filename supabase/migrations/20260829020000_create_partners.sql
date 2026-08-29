-- Partner / mentor content type (Section 16).
-- Public SELECT: every row is readable. `logo_permission` gates the logo column,
-- not the row, so the app layer strips `logo_url` when permission is not granted.
-- Admins CRUD via is_admin().

create type public.partner_type as enum (
  'corporate',
  'investors',
  'technology',
  'development',
  'mentors',
  'media'
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org text,
  type public.partner_type not null,
  contribution text,
  is_active boolean not null default true,
  logo_permission boolean not null default false,
  logo_url text,
  link text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partners_name_len_chk check (
    char_length(name) between 2 and 120
  ),
  constraint partners_org_len_chk check (
    org is null or char_length(org) between 2 and 160
  ),
  constraint partners_contribution_len_chk check (
    contribution is null or char_length(contribution) <= 2000
  ),
  constraint partners_link_len_chk check (
    link is null or char_length(link) <= 500
  ),
  constraint partners_link_format_chk check (
    link is null or link ~* '^https?://.+'
  ),
  constraint partners_sort_order_chk check (
    sort_order between 0 and 10000
  )
);

-- Public page reads active/historical rows grouped by type in display order.
create index partners_active_type_sort_idx
  on public.partners (is_active, type, sort_order, name);

create index partners_created_at_idx
  on public.partners (created_at desc);

create index partners_name_trgm_idx
  on public.partners using gin (name extensions.gin_trgm_ops);

create index partners_org_trgm_idx
  on public.partners using gin (org extensions.gin_trgm_ops);

create or replace function public.set_partners_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger partners_set_updated_at
  before update on public.partners
  for each row
  execute function public.set_partners_updated_at();

alter table public.partners enable row level security;

grant select on table public.partners to anon, authenticated;
grant insert, update, delete on table public.partners to authenticated;
grant select, insert, update, delete on table public.partners to service_role;

create policy "Anyone can read partners"
  on public.partners
  for select
  to anon, authenticated
  using (true);

create policy "Admins can insert partners"
  on public.partners
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update partners"
  on public.partners
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete partners"
  on public.partners
  for delete
  to authenticated
  using (public.is_admin());
