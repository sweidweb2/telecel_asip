-- 1) Form update RPCs must not overwrite media columns owned by upload actions.
-- 2) release_rate_limit refunds the latest hit when an insert fails after consume.

create or replace function public.update_startup_with_details(
  p_id uuid,
  p_core jsonb,
  p_details jsonb
)
returns table (id uuid, slug text, previous_slug text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_previous_slug text;
  v_slug text;
begin
  if not public.is_editor() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select s.slug into v_previous_slug
  from public.startups s
  where s.id = p_id
  for update;

  if v_previous_slug is null then
    raise exception 'startup not found' using errcode = 'P0002';
  end if;

  update public.startups s
  set
    name = p_core->>'name',
    slug = p_core->>'slug',
    description = p_core->>'description',
    status = (p_core->>'status')::public.startup_status,
    founded_at = nullif(p_core->>'founded_at', '')::date
  where s.id = p_id
  returning s.slug into v_slug;

  insert into public.startup_details (
    startup_id, website_url, industry, category, location, founding_year,
    team, size, problem, solution, target_market, business_model,
    funding_goal, amount_raised, cohort, country_code, sector, founder_names,
    cover_image_url, public_outcome, featured, image_focal_x, image_focal_y
  ) values (
    p_id,
    nullif(p_details->>'website_url', ''),
    nullif(p_details->>'industry', ''),
    nullif(p_details->>'category', ''),
    nullif(p_details->>'location', ''),
    nullif(p_details->>'founding_year', '')::integer,
    nullif(p_details->>'team', ''),
    nullif(p_details->>'size', ''),
    nullif(p_details->>'problem', ''),
    nullif(p_details->>'solution', ''),
    nullif(p_details->>'target_market', ''),
    nullif(p_details->>'business_model', ''),
    nullif(p_details->>'funding_goal', '')::numeric,
    nullif(p_details->>'amount_raised', '')::numeric,
    nullif(p_details->>'cohort', ''),
    nullif(p_details->>'country_code', ''),
    nullif(p_details->>'sector', ''),
    coalesce(
      array(
        select jsonb_array_elements_text(
          coalesce(p_details->'founder_names', '[]'::jsonb)
        )
      ),
      '{}'::text[]
    ),
    -- Create path only: cover starts empty. Updates preserve the live URL.
    null,
    nullif(p_details->>'public_outcome', ''),
    coalesce((p_details->>'featured')::boolean, false),
    coalesce((p_details->>'image_focal_x')::numeric, 50),
    coalesce((p_details->>'image_focal_y')::numeric, 50)
  )
  on conflict (startup_id) do update set
    website_url = excluded.website_url,
    industry = excluded.industry,
    category = excluded.category,
    location = excluded.location,
    founding_year = excluded.founding_year,
    team = excluded.team,
    size = excluded.size,
    problem = excluded.problem,
    solution = excluded.solution,
    target_market = excluded.target_market,
    business_model = excluded.business_model,
    funding_goal = excluded.funding_goal,
    amount_raised = excluded.amount_raised,
    cohort = excluded.cohort,
    country_code = excluded.country_code,
    sector = excluded.sector,
    founder_names = excluded.founder_names,
    -- Keep whatever upload/remove wrote; never take cover from the form RPC.
    cover_image_url = public.startup_details.cover_image_url,
    public_outcome = excluded.public_outcome,
    featured = excluded.featured,
    image_focal_x = excluded.image_focal_x,
    image_focal_y = excluded.image_focal_y;

  id := p_id;
  slug := v_slug;
  previous_slug := v_previous_slug;
  return next;
end;
$$;

comment on function public.update_startup_with_details(uuid, jsonb, jsonb) is
  'Editor update startup core + details. cover_image_url is owned by upload/remove and is preserved.';

create or replace function public.update_cohort_with_links(
  p_id uuid,
  p_cohort jsonb,
  p_partner_ids uuid[] default '{}'::uuid[],
  p_startup_ids uuid[] default '{}'::uuid[]
)
returns table (id uuid)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_exists uuid;
  v_partner_id uuid;
  v_startup_id uuid;
begin
  if not public.is_editor() then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  select c.id into v_exists
  from public.cohorts c
  where c.id = p_id
  for update;

  if v_exists is null then
    raise exception 'cohort not found' using errcode = 'P0002';
  end if;

  update public.cohorts c
  set
    year = (p_cohort->>'year')::integer,
    public_label = p_cohort->>'public_label',
    programme_dates_start = nullif(p_cohort->>'programme_dates_start', '')::date,
    programme_dates_end = nullif(p_cohort->>'programme_dates_end', '')::date,
    programme_status = (p_cohort->>'programme_status')::public.cohort_programme_status,
    summary = nullif(p_cohort->>'summary', ''),
    -- media_url owned by upload/remove — preserved on form save
    publish_status = (p_cohort->>'publish_status')::public.cms_publish_status
  where c.id = p_id;

  delete from public.cohort_partners where cohort_id = p_id;
  delete from public.cohort_startups where cohort_id = p_id;

  foreach v_partner_id in array coalesce(p_partner_ids, '{}'::uuid[])
  loop
    insert into public.cohort_partners (cohort_id, partner_id)
    values (p_id, v_partner_id);
  end loop;

  foreach v_startup_id in array coalesce(p_startup_ids, '{}'::uuid[])
  loop
    insert into public.cohort_startups (cohort_id, startup_id)
    values (p_id, v_startup_id);
  end loop;

  id := p_id;
  return next;
end;
$$;

comment on function public.update_cohort_with_links(uuid, jsonb, uuid[], uuid[]) is
  'Editor update cohort + link tables. media_url is owned by upload/remove and is preserved.';

create or replace function public.release_rate_limit(p_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hits bigint[];
  v_len integer;
begin
  if p_key is null or length(trim(p_key)) = 0 then
    return;
  end if;

  select hits into v_hits
  from public.rate_limit_buckets
  where bucket_key = p_key
  for update;

  if not found then
    return;
  end if;

  v_len := coalesce(cardinality(v_hits), 0);
  if v_len < 1 then
    return;
  end if;

  update public.rate_limit_buckets
  set
    hits = case
      when v_len = 1 then '{}'::bigint[]
      else v_hits[1:v_len - 1]
    end,
    updated_at = now()
  where bucket_key = p_key;
end;
$$;

revoke all on function public.release_rate_limit(text)
  from public, anon, authenticated;
grant execute on function public.release_rate_limit(text)
  to service_role;

comment on function public.release_rate_limit(text) is
  'Removes the latest hit for a rate-limit key (refund after a failed insert). Service role only.';
