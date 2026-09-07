-- Atomic admin create/update for events + event_startups (mirrors cohort link RPCs).

create or replace function public.create_event_with_links(
  p_event jsonb,
  p_startup_ids uuid[] default '{}'::uuid[]
)
returns table (
  id uuid
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  v_startup_id uuid;
  v_speakers text[];
  v_assets text[];
begin
  if not public.is_admin() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  select coalesce(
    array(
      select jsonb_array_elements_text(coalesce(p_event->'speakers', '[]'::jsonb))
    ),
    '{}'::text[]
  )
  into v_speakers;

  select coalesce(
    array(
      select jsonb_array_elements_text(coalesce(p_event->'assets', '[]'::jsonb))
    ),
    '{}'::text[]
  )
  into v_assets;

  insert into public.events (
    name,
    event_date,
    location,
    format,
    speakers,
    assets,
    outcomes,
    publish_status
  )
  values (
    p_event->>'name',
    (p_event->>'event_date')::date,
    nullif(p_event->>'location', ''),
    nullif(p_event->>'format', '')::public.event_format,
    v_speakers,
    v_assets,
    nullif(p_event->>'outcomes', ''),
    (p_event->>'publish_status')::public.cms_publish_status
  )
  returning events.id into v_id;

  foreach v_startup_id in array coalesce(p_startup_ids, '{}'::uuid[])
  loop
    insert into public.event_startups (event_id, startup_id)
    values (v_id, v_startup_id);
  end loop;

  id := v_id;
  return next;
end;
$$;

create or replace function public.update_event_with_links(
  p_id uuid,
  p_event jsonb,
  p_startup_ids uuid[] default '{}'::uuid[]
)
returns table (
  id uuid
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_exists uuid;
  v_startup_id uuid;
  v_speakers text[];
  v_assets text[];
begin
  if not public.is_admin() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  select e.id into v_exists
  from public.events e
  where e.id = p_id
  for update;

  if v_exists is null then
    raise exception 'event not found'
      using errcode = 'P0002';
  end if;

  select coalesce(
    array(
      select jsonb_array_elements_text(coalesce(p_event->'speakers', '[]'::jsonb))
    ),
    '{}'::text[]
  )
  into v_speakers;

  select coalesce(
    array(
      select jsonb_array_elements_text(coalesce(p_event->'assets', '[]'::jsonb))
    ),
    '{}'::text[]
  )
  into v_assets;

  update public.events e
  set
    name = p_event->>'name',
    event_date = (p_event->>'event_date')::date,
    location = nullif(p_event->>'location', ''),
    format = nullif(p_event->>'format', '')::public.event_format,
    speakers = v_speakers,
    assets = v_assets,
    outcomes = nullif(p_event->>'outcomes', ''),
    publish_status = (p_event->>'publish_status')::public.cms_publish_status
  where e.id = p_id;

  delete from public.event_startups where event_id = p_id;

  foreach v_startup_id in array coalesce(p_startup_ids, '{}'::uuid[])
  loop
    insert into public.event_startups (event_id, startup_id)
    values (p_id, v_startup_id);
  end loop;

  id := p_id;
  return next;
end;
$$;

grant execute on function public.create_event_with_links(jsonb, uuid[]) to authenticated;
grant execute on function public.update_event_with_links(uuid, jsonb, uuid[]) to authenticated;
