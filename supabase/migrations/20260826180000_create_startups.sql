-- Portfolio startups (core row) + 1:1 details.
-- Public SELECT: status = active only. Admins CRUD via is_admin().

create type public.startup_status as enum ('draft', 'active', 'inactive');

create table public.startups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  logo_url text,
  description text not null,
  status public.startup_status not null default 'draft',
  founded_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint startups_name_len_chk check (
    char_length(name) between 2 and 120
  ),
  constraint startups_slug_len_chk check (
    char_length(slug) between 2 and 120
  ),
  constraint startups_slug_format_chk check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint startups_description_len_chk check (
    char_length(description) between 2 and 2000
  )
);

create unique index startups_slug_uidx on public.startups (slug);

create index startups_status_created_at_idx
  on public.startups (status, created_at desc);

create index startups_created_at_idx
  on public.startups (created_at desc);

create index startups_name_trgm_idx
  on public.startups using gin (name extensions.gin_trgm_ops);

create or replace function public.set_startups_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger startups_set_updated_at
  before update on public.startups
  for each row
  execute function public.set_startups_updated_at();

create table public.startup_details (
  startup_id uuid primary key
    references public.startups (id) on delete cascade,
  website_url text,
  industry text,
  category text,
  location text,
  founding_year integer,
  team text,
  size text,
  problem text,
  solution text,
  target_market text,
  business_model text,
  funding_goal numeric,
  amount_raised numeric,
  constraint startup_details_founding_year_chk check (
    founding_year is null
    or (founding_year >= 1900 and founding_year <= 2100)
  ),
  constraint startup_details_funding_goal_chk check (
    funding_goal is null or funding_goal >= 0
  ),
  constraint startup_details_amount_raised_chk check (
    amount_raised is null or amount_raised >= 0
  ),
  constraint startup_details_funding_order_chk check (
    funding_goal is null
    or amount_raised is null
    or amount_raised <= funding_goal
  ),
  constraint startup_details_industry_len_chk check (
    industry is null or char_length(industry) <= 100
  ),
  constraint startup_details_category_len_chk check (
    category is null or char_length(category) <= 100
  ),
  constraint startup_details_location_len_chk check (
    location is null or char_length(location) <= 120
  ),
  constraint startup_details_size_len_chk check (
    size is null or char_length(size) <= 60
  ),
  constraint startup_details_team_len_chk check (
    team is null or char_length(team) <= 2000
  ),
  constraint startup_details_problem_len_chk check (
    problem is null or char_length(problem) <= 4000
  ),
  constraint startup_details_solution_len_chk check (
    solution is null or char_length(solution) <= 4000
  ),
  constraint startup_details_target_market_len_chk check (
    target_market is null or char_length(target_market) <= 2000
  ),
  constraint startup_details_business_model_len_chk check (
    business_model is null or char_length(business_model) <= 2000
  ),
  constraint startup_details_website_url_len_chk check (
    website_url is null or char_length(website_url) <= 500
  )
);

alter table public.startups enable row level security;
alter table public.startup_details enable row level security;

grant select on table public.startups to anon, authenticated;
grant insert, update, delete on table public.startups to authenticated;
grant select, insert, update, delete on table public.startups to service_role;

grant select on table public.startup_details to anon, authenticated;
grant insert, update, delete on table public.startup_details to authenticated;
grant select, insert, update, delete on table public.startup_details to service_role;

create policy "Anyone can read active startups"
  on public.startups
  for select
  to anon, authenticated
  using (status = 'active');

create policy "Admins can read all startups"
  on public.startups
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert startups"
  on public.startups
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update startups"
  on public.startups
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete startups"
  on public.startups
  for delete
  to authenticated
  using (public.is_admin());

create policy "Anyone can read details of active startups"
  on public.startup_details
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.startups s
      where s.id = startup_id
        and s.status = 'active'
    )
  );

create policy "Admins can read all startup details"
  on public.startup_details
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert startup details"
  on public.startup_details
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update startup details"
  on public.startup_details
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete startup details"
  on public.startup_details
  for delete
  to authenticated
  using (public.is_admin());
