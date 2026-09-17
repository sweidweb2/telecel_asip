-- Editor / admin staff split (20260910180000)
--
-- Roles:
--   * admin  — full platform control (Users hard-delete, backups, perf debug,
--              any profile role change).
--   * editor — CMS + intake + site_settings write access; Users list/stats;
--              may change editor↔viewer roles only (never create/touch admin).
--   * viewer — no staff write path via these helpers.
--
-- Helpers:
--   * is_admin()  — unchanged; still used for backups + admin_perf_events.
--   * is_editor() — role = 'editor' (CMS write RPCs / CMS RLS).
--   * is_staff()  — role in ('admin','editor') (profiles list/update, get_user_stats).
--
-- CMS / intake / settings / media RLS and CMS write RPCs move from is_admin()
-- to is_editor(). Backups and admin_perf_events stay on is_admin().

-- ---------------------------------------------------------------------------
-- 1–2. Role helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'editor'
  );
$$;

comment on function public.is_editor() is
  'True when auth.uid() has profiles.role = editor. Used by CMS/intake RLS and write RPCs.';

grant execute on function public.is_editor() to authenticated;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;

comment on function public.is_staff() is
  'True when auth.uid() is admin or editor. Used for profiles staff policies and get_user_stats.';

grant execute on function public.is_staff() to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Shell RPCs
-- ---------------------------------------------------------------------------

create or replace function public.get_staff_shell()
returns table (
  role public.user_role,
  is_admin boolean,
  is_editor boolean,
  full_name text,
  email text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    p.role,
    public.is_admin() as is_admin,
    public.is_editor() as is_editor,
    p.full_name,
    p.email
  from (select auth.uid() as uid) u
  left join public.profiles p on p.id = u.uid;
$$;

comment on function public.get_staff_shell() is
  'One-shot staff dashboard shell: role flags + profile fields for auth.uid(). Always one row.';

grant execute on function public.get_staff_shell() to authenticated;

-- Return type change requires drop + recreate.
drop function if exists public.get_admin_shell();

create function public.get_admin_shell()
returns table (
  is_admin boolean,
  is_editor boolean,
  role public.user_role,
  full_name text,
  email text
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    public.is_admin() as is_admin,
    public.is_editor() as is_editor,
    p.role,
    p.full_name,
    p.email
  from (select auth.uid() as uid) u
  left join public.profiles p on p.id = u.uid;
$$;

comment on function public.get_admin_shell() is
  'Dashboard shell compat RPC: is_admin, is_editor, role, full_name, email for auth.uid(). Prefer get_staff_shell for new callers.';

grant execute on function public.get_admin_shell() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Profile role-change guard
-- ---------------------------------------------------------------------------

create or replace function public.prevent_unauthorized_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is not distinct from old.role then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  if public.is_editor() then
    if old.role in ('editor', 'viewer')
       and new.role in ('editor', 'viewer') then
      return new;
    end if;

    raise exception
      'Editors may only change roles between editor and viewer; administrator roles cannot be created or modified'
      using errcode = '42501';
  end if;

  raise exception 'Only administrators and editors can change profile roles'
    using errcode = '42501';
end;
$$;

comment on function public.prevent_unauthorized_profile_role_change() is
  'BEFORE UPDATE OF role: admins any role; editors only editor↔viewer; viewers blocked.';

-- ---------------------------------------------------------------------------
-- 5. Profiles policies → is_staff()
-- ---------------------------------------------------------------------------

alter policy "Admins can read all profiles"
  on public.profiles
  using (public.is_staff());

alter policy "Admins can update all profiles"
  on public.profiles
  using (public.is_staff())
  with check (public.is_staff());

-- ---------------------------------------------------------------------------
-- 6. CMS / intake / settings / storage policies → is_editor()
--    (backups + admin_perf_events stay on is_admin — untouched)
-- ---------------------------------------------------------------------------

-- blogs
alter policy "Admins can read all blogs"
  on public.blogs
  using (public.is_editor());

alter policy "Admins can insert blogs"
  on public.blogs
  with check (public.is_editor());

alter policy "Admins can update blogs"
  on public.blogs
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete blogs"
  on public.blogs
  using (public.is_editor());

-- startups
alter policy "Admins can read all startups"
  on public.startups
  using (public.is_editor());

alter policy "Admins can insert startups"
  on public.startups
  with check (public.is_editor());

alter policy "Admins can update startups"
  on public.startups
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete startups"
  on public.startups
  using (public.is_editor());

-- startup_details
alter policy "Admins can read all startup details"
  on public.startup_details
  using (public.is_editor());

alter policy "Admins can insert startup details"
  on public.startup_details
  with check (public.is_editor());

alter policy "Admins can update startup details"
  on public.startup_details
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete startup details"
  on public.startup_details
  using (public.is_editor());

-- partners
alter policy "Admins can insert partners"
  on public.partners
  with check (public.is_editor());

alter policy "Admins can update partners"
  on public.partners
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete partners"
  on public.partners
  using (public.is_editor());

-- cohorts
alter policy "Admins can read all cohorts"
  on public.cohorts
  using (public.is_editor());

alter policy "Admins can insert cohorts"
  on public.cohorts
  with check (public.is_editor());

alter policy "Admins can update cohorts"
  on public.cohorts
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete cohorts"
  on public.cohorts
  using (public.is_editor());

-- cohort_partners
alter policy "Admins can read all cohort partners"
  on public.cohort_partners
  using (public.is_editor());

alter policy "Admins can insert cohort partners"
  on public.cohort_partners
  with check (public.is_editor());

alter policy "Admins can update cohort partners"
  on public.cohort_partners
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete cohort partners"
  on public.cohort_partners
  using (public.is_editor());

-- cohort_startups
alter policy "Admins can read all cohort startups"
  on public.cohort_startups
  using (public.is_editor());

alter policy "Admins can insert cohort startups"
  on public.cohort_startups
  with check (public.is_editor());

alter policy "Admins can update cohort startups"
  on public.cohort_startups
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete cohort startups"
  on public.cohort_startups
  using (public.is_editor());

-- events
alter policy "Admins can read all events"
  on public.events
  using (public.is_editor());

alter policy "Admins can insert events"
  on public.events
  with check (public.is_editor());

alter policy "Admins can update events"
  on public.events
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete events"
  on public.events
  using (public.is_editor());

-- event_startups
alter policy "Admins can read all event_startups"
  on public.event_startups
  using (public.is_editor());

alter policy "Admins can insert event_startups"
  on public.event_startups
  with check (public.is_editor());

alter policy "Admins can update event_startups"
  on public.event_startups
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete event_startups"
  on public.event_startups
  using (public.is_editor());

-- founder_stories
alter policy "Admins can read all founder stories"
  on public.founder_stories
  using (public.is_editor());

alter policy "Admins can insert founder stories"
  on public.founder_stories
  with check (public.is_editor());

alter policy "Admins can update founder stories"
  on public.founder_stories
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete founder stories"
  on public.founder_stories
  using (public.is_editor());

-- evidence_records
alter policy "Admins can read evidence records"
  on public.evidence_records
  using (public.is_editor());

alter policy "Admins can insert evidence records"
  on public.evidence_records
  with check (public.is_editor());

alter policy "Admins can update evidence records"
  on public.evidence_records
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete evidence records"
  on public.evidence_records
  using (public.is_editor());

-- impact_metrics
alter policy "Admins can read impact metrics"
  on public.impact_metrics
  using (public.is_editor());

alter policy "Admins can insert impact metrics"
  on public.impact_metrics
  with check (public.is_editor());

alter policy "Admins can update impact metrics"
  on public.impact_metrics
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete impact metrics"
  on public.impact_metrics
  using (public.is_editor());

-- applications
alter policy "Admins can read applications"
  on public.applications
  using (public.is_editor());

alter policy "Admins can update applications"
  on public.applications
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete applications"
  on public.applications
  using (public.is_editor());

-- interest_registrations
alter policy "Admins can read interest registrations"
  on public.interest_registrations
  using (public.is_editor());

alter policy "Admins can update interest registrations"
  on public.interest_registrations
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete interest registrations"
  on public.interest_registrations
  using (public.is_editor());

-- contact_messages
alter policy "Admins can read contact messages"
  on public.contact_messages
  using (public.is_editor());

alter policy "Admins can update contact messages"
  on public.contact_messages
  using (public.is_editor())
  with check (public.is_editor());

alter policy "Admins can delete contact messages"
  on public.contact_messages
  using (public.is_editor());

-- newsletter_subscribers
alter policy "Admins can read newsletter subscribers"
  on public.newsletter_subscribers
  using (public.is_editor());

alter policy "Admins can delete newsletter subscribers"
  on public.newsletter_subscribers
  using (public.is_editor());

-- site_settings
alter policy "Admins can update site settings"
  on public.site_settings
  using (public.is_editor())
  with check (public.is_editor());

-- storage: blog covers
alter policy "Admins can upload blog covers"
  on storage.objects
  with check (bucket_id = 'blogs' and public.is_editor());

alter policy "Admins can update blog covers"
  on storage.objects
  using (bucket_id = 'blogs' and public.is_editor())
  with check (bucket_id = 'blogs' and public.is_editor());

alter policy "Admins can delete blog covers"
  on storage.objects
  using (bucket_id = 'blogs' and public.is_editor());

-- storage: author avatars
alter policy "Admins can upload author avatars"
  on storage.objects
  with check (bucket_id = 'auther' and public.is_editor());

alter policy "Admins can update author avatars"
  on storage.objects
  using (bucket_id = 'auther' and public.is_editor())
  with check (bucket_id = 'auther' and public.is_editor());

alter policy "Admins can delete author avatars"
  on storage.objects
  using (bucket_id = 'auther' and public.is_editor());

-- storage: startup logos
alter policy "Admins can upload startup logos"
  on storage.objects
  with check (bucket_id = 'startups' and public.is_editor());

alter policy "Admins can update startup logos"
  on storage.objects
  using (bucket_id = 'startups' and public.is_editor())
  with check (bucket_id = 'startups' and public.is_editor());

alter policy "Admins can delete startup logos"
  on storage.objects
  using (bucket_id = 'startups' and public.is_editor());

-- storage: partner logos
alter policy "Admins can upload partner logos"
  on storage.objects
  with check (bucket_id = 'partners' and public.is_editor());

alter policy "Admins can update partner logos"
  on storage.objects
  using (bucket_id = 'partners' and public.is_editor())
  with check (bucket_id = 'partners' and public.is_editor());

alter policy "Admins can delete partner logos"
  on storage.objects
  using (bucket_id = 'partners' and public.is_editor());

-- ---------------------------------------------------------------------------
-- 8. CMS write RPCs → is_editor() (latest bodies; auth check only)
-- ---------------------------------------------------------------------------

create or replace function public.create_blog_with_featured(
  p_blog jsonb
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
  v_is_featured boolean;
  v_status public.blog_status;
begin
  if not public.is_editor() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  v_status := (p_blog->>'status')::public.blog_status;
  v_is_featured := coalesce((p_blog->>'is_featured')::boolean, false);

  if v_status = 'draft' then
    v_is_featured := false;
  end if;

  if v_is_featured then
    update public.blogs b
    set is_featured = false
    where b.is_featured;
  end if;

  insert into public.blogs (
    title,
    slug,
    summary,
    body_html,
    categories,
    author_name,
    status,
    is_featured,
    reading_time_minutes,
    published_at,
    startup_id,
    cohort_id,
    sources,
    meta_title,
    meta_description
  )
  values (
    p_blog->>'title',
    p_blog->>'slug',
    p_blog->>'summary',
    coalesce(p_blog->>'body_html', ''),
    coalesce(
      (
        select array_agg(value)
        from jsonb_array_elements_text(p_blog->'categories')
      ),
      '{}'::text[]
    ),
    p_blog->>'author_name',
    v_status,
    v_is_featured,
    coalesce((p_blog->>'reading_time_minutes')::integer, 1),
    case when v_status = 'published' then now() else null end,
    nullif(p_blog->>'startup_id', '')::uuid,
    nullif(p_blog->>'cohort_id', '')::uuid,
    coalesce(
      (
        select array_agg(value)
        from jsonb_array_elements_text(p_blog->'sources')
      ),
      '{}'::text[]
    ),
    nullif(p_blog->>'meta_title', ''),
    nullif(p_blog->>'meta_description', '')
  )
  returning blogs.id, blogs.slug into v_id, v_slug;

  id := v_id;
  slug := v_slug;
  return next;
end;
$$;

create or replace function public.update_blog_with_featured(
  p_id uuid,
  p_blog jsonb
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
  v_previous_published_at timestamptz;
  v_found boolean;
  v_slug text;
  v_is_featured boolean;
  v_status public.blog_status;
begin
  if not public.is_editor() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  select b.slug, b.published_at, true
  into v_previous_slug, v_previous_published_at, v_found
  from public.blogs b
  where b.id = p_id
  for update;

  if not coalesce(v_found, false) then
    raise exception 'blog not found'
      using errcode = 'P0002';
  end if;

  v_status := (p_blog->>'status')::public.blog_status;
  v_is_featured := coalesce((p_blog->>'is_featured')::boolean, false);

  if v_status = 'draft' then
    v_is_featured := false;
  end if;

  if v_is_featured then
    update public.blogs b
    set is_featured = false
    where b.is_featured
      and b.id is distinct from p_id;
  end if;

  update public.blogs b
  set
    title = p_blog->>'title',
    slug = p_blog->>'slug',
    summary = p_blog->>'summary',
    body_html = coalesce(p_blog->>'body_html', ''),
    categories = coalesce(
      (
        select array_agg(value)
        from jsonb_array_elements_text(p_blog->'categories')
      ),
      '{}'::text[]
    ),
    author_name = p_blog->>'author_name',
    status = v_status,
    is_featured = v_is_featured,
    reading_time_minutes = coalesce(
      (p_blog->>'reading_time_minutes')::integer,
      1
    ),
    published_at = case
      when v_status = 'published'
        then coalesce(v_previous_published_at, now())
      else v_previous_published_at
    end,
    startup_id = nullif(p_blog->>'startup_id', '')::uuid,
    cohort_id = nullif(p_blog->>'cohort_id', '')::uuid,
    sources = coalesce(
      (
        select array_agg(value)
        from jsonb_array_elements_text(p_blog->'sources')
      ),
      '{}'::text[]
    ),
    meta_title = nullif(p_blog->>'meta_title', ''),
    meta_description = nullif(p_blog->>'meta_description', '')
  where b.id = p_id
  returning b.slug into v_slug;

  id := p_id;
  slug := v_slug;
  previous_slug := v_previous_slug;
  return next;
end;
$$;

create or replace function public.create_startup_with_details(p_core jsonb, p_details jsonb)
returns table (id uuid, slug text)
language plpgsql security invoker set search_path = public
as $$
declare v_id uuid; v_slug text;
begin
  if not public.is_editor() then raise exception 'not authorized' using errcode = '42501'; end if;
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
  if not public.is_editor() then raise exception 'not authorized' using errcode = '42501'; end if;
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

create or replace function public.create_cohort_with_links(
  p_cohort jsonb,
  p_partner_ids uuid[] default '{}'::uuid[],
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
  v_partner_id uuid;
  v_startup_id uuid;
begin
  if not public.is_editor() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  insert into public.cohorts (
    year,
    public_label,
    programme_dates_start,
    programme_dates_end,
    programme_status,
    summary,
    media_url,
    publish_status
  )
  values (
    (p_cohort->>'year')::integer,
    p_cohort->>'public_label',
    nullif(p_cohort->>'programme_dates_start', '')::date,
    nullif(p_cohort->>'programme_dates_end', '')::date,
    (p_cohort->>'programme_status')::public.cohort_programme_status,
    nullif(p_cohort->>'summary', ''),
    nullif(p_cohort->>'media_url', ''),
    (p_cohort->>'publish_status')::public.cms_publish_status
  )
  returning cohorts.id into v_id;

  foreach v_partner_id in array coalesce(p_partner_ids, '{}'::uuid[])
  loop
    insert into public.cohort_partners (cohort_id, partner_id)
    values (v_id, v_partner_id);
  end loop;

  foreach v_startup_id in array coalesce(p_startup_ids, '{}'::uuid[])
  loop
    insert into public.cohort_startups (cohort_id, startup_id)
    values (v_id, v_startup_id);
  end loop;

  id := v_id;
  return next;
end;
$$;

create or replace function public.update_cohort_with_links(
  p_id uuid,
  p_cohort jsonb,
  p_partner_ids uuid[] default '{}'::uuid[],
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
  v_partner_id uuid;
  v_startup_id uuid;
begin
  if not public.is_editor() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  select c.id into v_exists
  from public.cohorts c
  where c.id = p_id
  for update;

  if v_exists is null then
    raise exception 'cohort not found'
      using errcode = 'P0002';
  end if;

  update public.cohorts c
  set
    year = (p_cohort->>'year')::integer,
    public_label = p_cohort->>'public_label',
    programme_dates_start = nullif(p_cohort->>'programme_dates_start', '')::date,
    programme_dates_end = nullif(p_cohort->>'programme_dates_end', '')::date,
    programme_status = (p_cohort->>'programme_status')::public.cohort_programme_status,
    summary = nullif(p_cohort->>'summary', ''),
    media_url = nullif(p_cohort->>'media_url', ''),
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
  if not public.is_editor() then
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
  if not public.is_editor() then
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

-- ---------------------------------------------------------------------------
-- 9. get_user_stats → is_staff()
-- ---------------------------------------------------------------------------

create or replace function public.get_user_stats()
returns table (
  total bigint,
  admins bigint,
  editors bigint,
  viewers bigint,
  new_this_week bigint,
  new_this_month bigint
)
language plpgsql
stable
security invoker
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  return query
  select
    count(*)::bigint as total,
    count(*) filter (where p.role = 'admin')::bigint as admins,
    count(*) filter (where p.role = 'editor')::bigint as editors,
    count(*) filter (where p.role = 'viewer')::bigint as viewers,
    count(*) filter (
      where p.created_at >= date_trunc('week', timezone('utc', now()))
    )::bigint as new_this_week,
    count(*) filter (
      where p.created_at >= date_trunc('month', timezone('utc', now()))
    )::bigint as new_this_month
  from public.profiles p;
end;
$$;

-- ---------------------------------------------------------------------------
-- 10. get_admin_analytics → is_editor()
-- ---------------------------------------------------------------------------

create or replace function public.get_admin_analytics()
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  since_7 timestamptz := timezone('utc', now()) - interval '7 days';
  since_30 timestamptz := timezone('utc', now()) - interval '30 days';
  result jsonb;
begin
  if not public.is_editor() then
    raise exception 'not authorized'
      using errcode = '42501';
  end if;

  select jsonb_build_object(
    'applications', (
      select jsonb_build_object(
        'total', count(*)::bigint,
        'unread', count(*) filter (where a.inbox_status = 'unread')::bigint,
        'reviewed', count(*) filter (where a.inbox_status = 'reviewed')::bigint,
        'archived', count(*) filter (where a.inbox_status = 'archived')::bigint,
        'last7Days', count(*) filter (where a.created_at >= since_7)::bigint,
        'last30Days', count(*) filter (where a.created_at >= since_30)::bigint
      )
      from public.applications a
    ),
    'registrations', (
      select jsonb_build_object(
        'total', count(*)::bigint,
        'unread', count(*) filter (where r.inbox_status = 'unread')::bigint,
        'reviewed', count(*) filter (where r.inbox_status = 'reviewed')::bigint,
        'archived', count(*) filter (where r.inbox_status = 'archived')::bigint,
        'last7Days', count(*) filter (where r.created_at >= since_7)::bigint,
        'last30Days', count(*) filter (where r.created_at >= since_30)::bigint
      )
      from public.interest_registrations r
    ),
    'contactMessages', (
      select jsonb_build_object(
        'total', count(*)::bigint,
        'unread', count(*) filter (where c.inbox_status = 'unread')::bigint,
        'reviewed', count(*) filter (where c.inbox_status = 'reviewed')::bigint,
        'archived', count(*) filter (where c.inbox_status = 'archived')::bigint,
        'last7Days', count(*) filter (where c.created_at >= since_7)::bigint,
        'last30Days', count(*) filter (where c.created_at >= since_30)::bigint
      )
      from public.contact_messages c
    ),
    'content', jsonb_build_object(
      'blogsPublished', (select count(*)::bigint from public.blogs where status = 'published'),
      'blogsDraft', (select count(*)::bigint from public.blogs where status = 'draft'),
      'startupsActive', (select count(*)::bigint from public.startups where status = 'active'),
      'startupsOther', (select count(*)::bigint from public.startups where status is distinct from 'active'),
      'partnersActive', (select count(*)::bigint from public.partners where is_active = true),
      'partnersHistorical', (select count(*)::bigint from public.partners where is_active = false),
      'cohortsPublished', (select count(*)::bigint from public.cohorts where publish_status = 'published'),
      'cohortsDraft', (select count(*)::bigint from public.cohorts where publish_status = 'draft'),
      'eventsPublished', (select count(*)::bigint from public.events where publish_status = 'published'),
      'eventsDraft', (select count(*)::bigint from public.events where publish_status = 'draft'),
      'storiesPublished', (select count(*)::bigint from public.founder_stories where publish_status = 'published'),
      'storiesDraft', (select count(*)::bigint from public.founder_stories where publish_status = 'draft'),
      'metricsVerified', (select count(*)::bigint from public.impact_metrics where publish_status = 'verified'),
      'metricsOther', (select count(*)::bigint from public.impact_metrics where publish_status is distinct from 'verified')
    )
  )
  into result;

  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- 11. admin_hard_delete_user (admin-only)
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

  -- owner_id ON DELETE RESTRICT; clear links before auth.users cascade removes profile.
  delete from public.evidence_records
  where owner_id = p_target;

  delete from auth.users
  where id = p_target;
end;
$$;

comment on function public.admin_hard_delete_user(uuid) is
  'Admin-only hard delete of non-admin users: clears evidence_records ownership then deletes auth.users (profile cascades).';

grant execute on function public.admin_hard_delete_user(uuid) to authenticated;
