-- Data integrity guards:
-- 1) Last admin / last editor enforced in the DB (with hard-delete bypass for editors)
-- 2) Intake open/closed gates on INSERT (service-role bypasses RLS, not triggers)
-- 3) Atomic partner create/update with sort-order displacement
-- 4) Atomic blog status toggle (publish/draft) with row lock
-- 5) Clearer hard-delete failure when evidence is linked to impact metrics

-- ---------------------------------------------------------------------------
-- 1. Last staff role guards
-- ---------------------------------------------------------------------------

create or replace function public.enforce_last_staff_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bypass text;
begin
  if tg_op = 'UPDATE' then
    if old.role = 'admin' and new.role is distinct from 'admin' then
      perform 1 from public.profiles where role = 'admin' for update;
      if (select count(*)::int from public.profiles where role = 'admin') <= 1 then
        raise exception 'Cannot demote or remove the last administrator'
          using errcode = 'P0001';
      end if;
    end if;

    if old.role = 'editor' and new.role is distinct from 'editor' then
      v_bypass := nullif(current_setting('app.bypass_last_editor_guard', true), '');
      if v_bypass is distinct from 'on' then
        perform 1 from public.profiles where role = 'editor' for update;
        if (select count(*)::int from public.profiles where role = 'editor') <= 1 then
          raise exception 'Cannot demote or remove the last editor'
            using errcode = 'P0001';
        end if;
      end if;
    end if;

    return new;
  end if;

  -- DELETE
  if old.role = 'admin' then
    perform 1 from public.profiles where role = 'admin' for update;
    if (select count(*)::int from public.profiles where role = 'admin') <= 1 then
      raise exception 'Cannot demote or remove the last administrator'
        using errcode = 'P0001';
    end if;
  end if;

  if old.role = 'editor' then
    v_bypass := nullif(current_setting('app.bypass_last_editor_guard', true), '');
    if v_bypass is distinct from 'on' then
      perform 1 from public.profiles where role = 'editor' for update;
      if (select count(*)::int from public.profiles where role = 'editor') <= 1 then
        raise exception 'Cannot demote or remove the last editor'
          using errcode = 'P0001';
      end if;
    end if;
  end if;

  return old;
end;
$$;

comment on function public.enforce_last_staff_role() is
  'BEFORE UPDATE/DELETE on profiles: blocks removing the last admin (always) and last editor (unless app.bypass_last_editor_guard=on for hard-delete).';

drop trigger if exists profiles_enforce_last_staff_role_update on public.profiles;
create trigger profiles_enforce_last_staff_role_update
  before update of role on public.profiles
  for each row
  execute function public.enforce_last_staff_role();

drop trigger if exists profiles_enforce_last_staff_role_delete on public.profiles;
create trigger profiles_enforce_last_staff_role_delete
  before delete on public.profiles
  for each row
  execute function public.enforce_last_staff_role();

revoke all on function public.enforce_last_staff_role() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. admin_hard_delete_user: bypass last-editor + clearer impact-metric block
-- ---------------------------------------------------------------------------

create or replace function public.admin_hard_delete_user(p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  if not public.is_admin() then
    raise exception 'Only administrators can hard-delete users'
      using errcode = '42501';
  end if;

  if p_target is null then
    raise exception 'Target user id is required'
      using errcode = '22023';
  end if;

  if p_target = auth.uid() then
    raise exception 'Administrators cannot hard-delete their own account'
      using errcode = '42501';
  end if;

  select p.role into v_role
  from public.profiles p
  where p.id = p_target;

  if v_role is null then
    raise exception 'Target user profile not found'
      using errcode = 'P0002';
  end if;

  if v_role = 'admin' then
    raise exception 'Hard-delete is not allowed for administrator accounts'
      using errcode = '42501';
  end if;

  if exists (
    select 1
    from public.evidence_records er
    join public.impact_metrics im on im.evidence_id = er.id
    where er.owner_id = p_target
  ) then
    raise exception 'Cannot hard-delete: this user owns evidence linked to impact metrics. Unlink or delete those metrics first.'
      using errcode = '23503';
  end if;

  -- Hard-delete may remove the last editor when evidence must be cleared.
  perform set_config('app.bypass_last_editor_guard', 'on', true);

  delete from public.evidence_records
  where owner_id = p_target;

  delete from auth.users
  where id = p_target;
end;
$$;

comment on function public.admin_hard_delete_user(uuid) is
  'Admin-only hard delete of non-admin users: clears evidence_records ownership then deletes auth.users (profile cascades). Bypasses last-editor guard. Blocks when evidence is linked to impact_metrics.';

-- ---------------------------------------------------------------------------
-- 3. Intake open/closed INSERT gates
-- ---------------------------------------------------------------------------

create or replace function public.enforce_intake_requires_open()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_open boolean;
begin
  select s.open_applications into v_open
  from public.site_settings s
  where s.id = 1;

  if not coalesce(v_open, false) then
    raise exception 'applications are closed'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_intake_requires_closed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_open boolean;
begin
  select s.open_applications into v_open
  from public.site_settings s
  where s.id = 1;

  if coalesce(v_open, false) then
    raise exception 'applications are open'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

comment on function public.enforce_intake_requires_open() is
  'BEFORE INSERT: blocks applications / investor_engagements while open_applications is false.';

comment on function public.enforce_intake_requires_closed() is
  'BEFORE INSERT: blocks interest_registrations / investor_interests while open_applications is true.';

drop trigger if exists applications_require_open on public.applications;
create trigger applications_require_open
  before insert on public.applications
  for each row
  execute function public.enforce_intake_requires_open();

drop trigger if exists investor_engagements_require_open on public.investor_engagements;
create trigger investor_engagements_require_open
  before insert on public.investor_engagements
  for each row
  execute function public.enforce_intake_requires_open();

drop trigger if exists interest_registrations_require_closed on public.interest_registrations;
create trigger interest_registrations_require_closed
  before insert on public.interest_registrations
  for each row
  execute function public.enforce_intake_requires_closed();

drop trigger if exists investor_interests_require_closed on public.investor_interests;
create trigger investor_interests_require_closed
  before insert on public.investor_interests
  for each row
  execute function public.enforce_intake_requires_closed();

revoke all on function public.enforce_intake_requires_open() from public, anon, authenticated;
revoke all on function public.enforce_intake_requires_closed() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Partner create/update with atomic sort-order displacement
-- ---------------------------------------------------------------------------

create or replace function public.partners_displace_sort_order(
  p_desired integer,
  p_current_id uuid default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_occupant uuid;
  v_slot integer;
begin
  if p_desired < 1 or p_desired > 170 then
    raise exception 'sort_order out of range'
      using errcode = '22023';
  end if;

  -- Serialize concurrent sort assignment for the whole table.
  perform 1 from public.partners for update;

  select p.id into v_occupant
  from public.partners p
  where p.sort_order = p_desired
    and (p_current_id is null or p.id <> p_current_id)
  limit 1;

  if v_occupant is null then
    return;
  end if;

  for v_slot in 1..170 loop
    if v_slot = p_desired then
      continue;
    end if;
    if not exists (
      select 1
      from public.partners p
      where p.sort_order = v_slot
        and p.id <> v_occupant
    ) then
      update public.partners
      set sort_order = v_slot
      where id = v_occupant;
      return;
    end if;
  end loop;

  -- Range full of distinct orders; leave occupant in place (write may collide
  -- on CHECK only — sort_order is not unique). Prefer keeping desired free.
  update public.partners
  set sort_order = least(170, greatest(1, p_desired + 1))
  where id = v_occupant
    and sort_order = p_desired;
end;
$$;

comment on function public.partners_displace_sort_order(integer, uuid) is
  'Moves the partner occupying p_desired to the first free slot (1–170), locking partners for update.';

create or replace function public.create_partner_with_sort_order(p_partner jsonb)
returns table (id uuid)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
  v_desired integer;
begin
  if not public.is_editor() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  v_desired := coalesce((p_partner->>'sort_order')::integer, 1);
  perform public.partners_displace_sort_order(v_desired, null);

  insert into public.partners (
    name,
    org,
    type,
    contribution,
    is_active,
    logo_permission,
    link,
    sort_order
  )
  values (
    p_partner->>'name',
    nullif(p_partner->>'org', ''),
    (p_partner->>'type')::public.partner_type,
    nullif(p_partner->>'contribution', ''),
    coalesce((p_partner->>'is_active')::boolean, true),
    coalesce((p_partner->>'logo_permission')::boolean, false),
    nullif(p_partner->>'link', ''),
    v_desired
  )
  returning partners.id into v_id;

  id := v_id;
  return next;
end;
$$;

create or replace function public.update_partner_with_sort_order(
  p_id uuid,
  p_partner jsonb
)
returns table (id uuid)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_exists uuid;
  v_desired integer;
begin
  if not public.is_editor() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  select p.id into v_exists
  from public.partners p
  where p.id = p_id
  for update;

  if v_exists is null then
    raise exception 'partner not found'
      using errcode = 'P0002';
  end if;

  v_desired := coalesce((p_partner->>'sort_order')::integer, 1);
  perform public.partners_displace_sort_order(v_desired, p_id);

  update public.partners p
  set
    name = p_partner->>'name',
    org = nullif(p_partner->>'org', ''),
    type = (p_partner->>'type')::public.partner_type,
    contribution = nullif(p_partner->>'contribution', ''),
    is_active = coalesce((p_partner->>'is_active')::boolean, true),
    logo_permission = coalesce((p_partner->>'logo_permission')::boolean, false),
    link = nullif(p_partner->>'link', ''),
    sort_order = v_desired
  where p.id = p_id;

  id := p_id;
  return next;
end;
$$;

comment on function public.create_partner_with_sort_order(jsonb) is
  'Editor create partner + atomic sort-order displacement in one transaction.';

comment on function public.update_partner_with_sort_order(uuid, jsonb) is
  'Editor update partner + atomic sort-order displacement in one transaction.';

grant execute on function public.partners_displace_sort_order(integer, uuid) to authenticated;
grant execute on function public.create_partner_with_sort_order(jsonb) to authenticated;
grant execute on function public.update_partner_with_sort_order(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. Atomic blog status (publish / draft)
-- ---------------------------------------------------------------------------

create or replace function public.update_blog_status(
  p_id uuid,
  p_status public.blog_status
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
  v_slug text;
  v_published_at timestamptz;
  v_is_featured boolean;
begin
  if not public.is_editor() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  select b.slug, b.published_at, b.is_featured
  into v_slug, v_published_at, v_is_featured
  from public.blogs b
  where b.id = p_id
  for update;

  if v_slug is null then
    raise exception 'blog not found'
      using errcode = 'P0002';
  end if;

  if p_status = 'draft' then
    v_is_featured := false;
  end if;

  update public.blogs b
  set
    status = p_status,
    is_featured = v_is_featured,
    published_at = case
      when p_status = 'published' then coalesce(v_published_at, now())
      else v_published_at
    end
  where b.id = p_id;

  id := p_id;
  slug := v_slug;
  return next;
end;
$$;

comment on function public.update_blog_status(uuid, public.blog_status) is
  'Editor publish/draft toggle under row lock; clears featured on draft; stamps published_at once.';

grant execute on function public.update_blog_status(uuid, public.blog_status) to authenticated;
