-- Publication-safe portfolio fields and a flattened anonymous view.

alter table public.startup_details
  add column cohort text,
  add column country_code text,
  add column sector text,
  add column founder_names text[] not null default '{}',
  add column cover_image_url text,
  add column public_outcome text,
  add column featured boolean not null default false,
  add column image_focal_x numeric not null default 50,
  add column image_focal_y numeric not null default 50,
  add constraint startup_details_cohort_len_chk check (cohort is null or char_length(cohort) <= 40),
  add constraint startup_details_country_code_chk check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  add constraint startup_details_sector_len_chk check (sector is null or char_length(sector) <= 100),
  add constraint startup_details_founder_names_chk check (cardinality(founder_names) <= 12),
  add constraint startup_details_cover_image_url_len_chk check (cover_image_url is null or char_length(cover_image_url) <= 500),
  add constraint startup_details_public_outcome_len_chk check (public_outcome is null or char_length(public_outcome) <= 2000),
  add constraint startup_details_focal_x_chk check (image_focal_x between 0 and 100),
  add constraint startup_details_focal_y_chk check (image_focal_y between 0 and 100);

create index startup_details_cohort_idx on public.startup_details (cohort);
create index startup_details_country_code_idx on public.startup_details (country_code);
create index startup_details_sector_idx on public.startup_details (sector);
create index startup_details_featured_idx on public.startup_details (featured) where featured;
create index startup_details_founder_names_gin_idx on public.startup_details using gin (founder_names);

revoke select on table public.startups from anon;
revoke select on table public.startup_details from anon;
drop policy if exists "Anyone can read active startups" on public.startups;
drop policy if exists "Anyone can read details of active startups" on public.startup_details;

create or replace view public.startups_public
with (security_barrier = true)
as
select
  s.id,
  s.name,
  s.slug,
  s.logo_url,
  s.description,
  s.founded_at,
  s.updated_at,
  d.website_url,
  d.industry,
  d.category,
  d.location,
  d.team,
  d.cohort,
  d.country_code,
  d.sector,
  coalesce(d.founder_names, '{}') as founder_names,
  d.cover_image_url,
  d.public_outcome,
  coalesce(d.featured, false) as featured,
  coalesce(d.image_focal_x, 50) as image_focal_x,
  coalesce(d.image_focal_y, 50) as image_focal_y
from public.startups s
left join public.startup_details d on d.startup_id = s.id
where s.status = 'active';

grant select on table public.startups_public to anon, authenticated;

create or replace function public.create_startup_with_details(p_core jsonb, p_details jsonb)
returns table (id uuid, slug text)
language plpgsql security invoker set search_path = public
as $$
declare v_id uuid; v_slug text;
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  insert into public.startups (name, slug, description, status, founded_at)
  values (p_core->>'name', p_core->>'slug', p_core->>'description', (p_core->>'status')::public.startup_status, nullif(p_core->>'founded_at', '')::date)
  returning startups.id, startups.slug into v_id, v_slug;
  insert into public.startup_details (
    startup_id, website_url, industry, category, location, founding_year, team, size, problem, solution, target_market, business_model, funding_goal, amount_raised,
    cohort, country_code, sector, founder_names, cover_image_url, public_outcome, featured, image_focal_x, image_focal_y
  ) values (
    v_id, nullif(p_details->>'website_url',''), nullif(p_details->>'industry',''), nullif(p_details->>'category',''), nullif(p_details->>'location',''), nullif(p_details->>'founding_year','')::integer,
    nullif(p_details->>'team',''), nullif(p_details->>'size',''), nullif(p_details->>'problem',''), nullif(p_details->>'solution',''), nullif(p_details->>'target_market',''), nullif(p_details->>'business_model',''),
    nullif(p_details->>'funding_goal','')::numeric, nullif(p_details->>'amount_raised','')::numeric, nullif(p_details->>'cohort',''), nullif(p_details->>'country_code',''), nullif(p_details->>'sector',''),
    coalesce(array(select jsonb_array_elements_text(coalesce(p_details->'founder_names','[]'::jsonb))), '{}'), nullif(p_details->>'cover_image_url',''), nullif(p_details->>'public_outcome',''),
    coalesce((p_details->>'featured')::boolean,false), coalesce((p_details->>'image_focal_x')::numeric,50), coalesce((p_details->>'image_focal_y')::numeric,50)
  );
  id := v_id; slug := v_slug; return next;
end;
$$;

create or replace function public.update_startup_with_details(p_id uuid, p_core jsonb, p_details jsonb)
returns table (id uuid, slug text, previous_slug text)
language plpgsql security invoker set search_path = public
as $$
declare v_previous_slug text; v_slug text;
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  select s.slug into v_previous_slug from public.startups s where s.id = p_id for update;
  if v_previous_slug is null then raise exception 'startup not found' using errcode = 'P0002'; end if;
  update public.startups s set name=p_core->>'name', slug=p_core->>'slug', description=p_core->>'description', status=(p_core->>'status')::public.startup_status, founded_at=nullif(p_core->>'founded_at','')::date where s.id=p_id returning s.slug into v_slug;
  insert into public.startup_details (
    startup_id, website_url, industry, category, location, founding_year, team, size, problem, solution, target_market, business_model, funding_goal, amount_raised,
    cohort, country_code, sector, founder_names, cover_image_url, public_outcome, featured, image_focal_x, image_focal_y
  ) values (
    p_id, nullif(p_details->>'website_url',''), nullif(p_details->>'industry',''), nullif(p_details->>'category',''), nullif(p_details->>'location',''), nullif(p_details->>'founding_year','')::integer,
    nullif(p_details->>'team',''), nullif(p_details->>'size',''), nullif(p_details->>'problem',''), nullif(p_details->>'solution',''), nullif(p_details->>'target_market',''), nullif(p_details->>'business_model',''),
    nullif(p_details->>'funding_goal','')::numeric, nullif(p_details->>'amount_raised','')::numeric, nullif(p_details->>'cohort',''), nullif(p_details->>'country_code',''), nullif(p_details->>'sector',''),
    coalesce(array(select jsonb_array_elements_text(coalesce(p_details->'founder_names','[]'::jsonb))), '{}'), nullif(p_details->>'cover_image_url',''), nullif(p_details->>'public_outcome',''),
    coalesce((p_details->>'featured')::boolean,false), coalesce((p_details->>'image_focal_x')::numeric,50), coalesce((p_details->>'image_focal_y')::numeric,50)
  ) on conflict (startup_id) do update set
    website_url=excluded.website_url, industry=excluded.industry, category=excluded.category, location=excluded.location, founding_year=excluded.founding_year, team=excluded.team, size=excluded.size,
    problem=excluded.problem, solution=excluded.solution, target_market=excluded.target_market, business_model=excluded.business_model, funding_goal=excluded.funding_goal, amount_raised=excluded.amount_raised,
    cohort=excluded.cohort, country_code=excluded.country_code, sector=excluded.sector, founder_names=excluded.founder_names, cover_image_url=excluded.cover_image_url,
    public_outcome=excluded.public_outcome, featured=excluded.featured, image_focal_x=excluded.image_focal_x, image_focal_y=excluded.image_focal_y;
  id:=p_id; slug:=v_slug; previous_slug:=v_previous_slug; return next;
end;
$$;
