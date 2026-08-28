-- Transactional admin create/update for blogs.
-- Folds the "unfeature every other post" step into the same transaction as the
-- insert/update, so a failed write can no longer leave zero featured posts.

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

  -- Drafts are never the public hero.
  if v_status = 'draft' then
    v_is_featured := false;
  end if;

  -- blogs_one_featured_uidx is not deferrable, so the old hero must be
  -- cleared before the new one is written.
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
    published_at
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
    case when v_status = 'published' then now() else null end
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
    -- First publish stamps the date; later edits keep the original.
    published_at = case
      when v_status = 'published'
        then coalesce(v_previous_published_at, now())
      else v_previous_published_at
    end
  where b.id = p_id
  returning b.slug into v_slug;

  id := p_id;
  slug := v_slug;
  previous_slug := v_previous_slug;
  return next;
end;
$$;

grant execute on function public.create_blog_with_featured(jsonb) to authenticated;
grant execute on function public.update_blog_with_featured(uuid, jsonb) to authenticated;
