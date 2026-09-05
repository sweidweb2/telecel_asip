-- Article/Case Study gaps on blogs: related founder/cohort, sources, CMS SEO.
-- Also extends create/update blog RPCs to persist the new columns.

alter table public.blogs
  add column if not exists startup_id uuid
    references public.startups (id) on delete set null,
  add column if not exists cohort_id uuid
    references public.cohorts (id) on delete set null,
  add column if not exists sources text[] not null default '{}'::text[],
  add column if not exists meta_title text,
  add column if not exists meta_description text;

create or replace function public.blog_sources_within_bounds(sources text[])
returns boolean
language sql
immutable
as $$
  select
    cardinality(sources) <= 20
    and (
      cardinality(sources) = 0
      or not exists (
        select 1
        from unnest(sources) as s
        where char_length(trim(s)) < 1
           or char_length(trim(s)) > 500
      )
    );
$$;

alter table public.blogs
  drop constraint if exists blogs_sources_count_chk,
  drop constraint if exists blogs_sources_item_len_chk,
  drop constraint if exists blogs_sources_bounds_chk,
  drop constraint if exists blogs_meta_title_len_chk,
  drop constraint if exists blogs_meta_description_len_chk;

alter table public.blogs
  add constraint blogs_sources_bounds_chk
    check (public.blog_sources_within_bounds(sources)),
  add constraint blogs_meta_title_len_chk
    check (meta_title is null or char_length(meta_title) between 2 and 120),
  add constraint blogs_meta_description_len_chk
    check (
      meta_description is null
      or char_length(meta_description) between 2 and 300
    );

create index if not exists blogs_startup_id_idx
  on public.blogs (startup_id)
  where startup_id is not null;

create index if not exists blogs_cohort_id_idx
  on public.blogs (cohort_id)
  where cohort_id is not null;

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
  if not public.is_admin() then
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
  if not public.is_admin() then
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
