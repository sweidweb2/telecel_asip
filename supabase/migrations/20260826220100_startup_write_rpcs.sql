-- Transactional admin create/update for startups + 1:1 startup_details.

create or replace function public.create_startup_with_details(
  p_core jsonb,
  p_details jsonb
)
returns table (
  id uuid,
  slug text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  v_slug text;
begin
  if not public.is_admin() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  insert into public.startups (
    name,
    slug,
    description,
    status,
    founded_at
  )
  values (
    p_core->>'name',
    p_core->>'slug',
    p_core->>'description',
    (p_core->>'status')::public.startup_status,
    nullif(p_core->>'founded_at', '')::date
  )
  returning startups.id, startups.slug into v_id, v_slug;

  insert into public.startup_details (
    startup_id,
    website_url,
    industry,
    category,
    location,
    founding_year,
    team,
    size,
    problem,
    solution,
    target_market,
    business_model,
    funding_goal,
    amount_raised
  )
  values (
    v_id,
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
    nullif(p_details->>'amount_raised', '')::numeric
  );

  id := v_id;
  slug := v_slug;
  return next;
end;
$$;

create or replace function public.update_startup_with_details(
  p_id uuid,
  p_core jsonb,
  p_details jsonb
)
returns table (
  id uuid,
  slug text,
  previous_slug text
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_previous_slug text;
  v_slug text;
begin
  if not public.is_admin() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  select s.slug into v_previous_slug
  from public.startups s
  where s.id = p_id
  for update;

  if v_previous_slug is null then
    raise exception 'startup not found'
      using errcode = 'P0002';
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
    startup_id,
    website_url,
    industry,
    category,
    location,
    founding_year,
    team,
    size,
    problem,
    solution,
    target_market,
    business_model,
    funding_goal,
    amount_raised
  )
  values (
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
    nullif(p_details->>'amount_raised', '')::numeric
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
    amount_raised = excluded.amount_raised;

  id := p_id;
  slug := v_slug;
  previous_slug := v_previous_slug;
  return next;
end;
$$;

grant execute on function public.create_startup_with_details(jsonb, jsonb) to authenticated;
grant execute on function public.update_startup_with_details(uuid, jsonb, jsonb) to authenticated;
