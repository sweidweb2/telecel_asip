-- Related posts for an Insights detail page in one round trip.
--
-- The app previously ran up to three sequential queries: read the current post's
-- categories, fetch same-category posts, then top up from recency while excluding
-- the ids already collected. This does the same ranking in a single statement.
--
-- security invoker so the "Anyone can read published blogs" RLS policy still
-- applies — anon must not see drafts through this function.

create or replace function public.get_related_published_blogs(
  p_slug text,
  p_limit integer default 3
)
returns table (
  id uuid,
  slug text,
  title text,
  summary text,
  categories text[],
  thumbnail_url text,
  author_name text,
  author_avatar_url text,
  reading_time_minutes integer,
  published_at timestamptz,
  is_featured boolean
)
language sql
stable
security invoker
set search_path = public
as $$
  with current_post as (
    select b.categories[1] as primary_category
    from public.blogs b
    where b.slug = p_slug
      and b.status = 'published'
  )
  select
    b.id,
    b.slug,
    b.title,
    b.summary,
    b.categories,
    b.thumbnail_url,
    b.author_name,
    b.author_avatar_url,
    b.reading_time_minutes,
    b.published_at,
    b.is_featured
  from public.blogs b
  -- left join: an unknown slug or a post with no categories still yields the
  -- recency fallback rather than an empty result.
  left join current_post c on true
  where b.status = 'published'
    and b.slug <> p_slug
  order by
    case
      when c.primary_category is not null
        and b.categories @> array[c.primary_category]
      then 0
      else 1
    end,
    b.published_at desc nulls last,
    b.id
  limit greatest(p_limit, 0);
$$;

revoke all on function public.get_related_published_blogs(text, integer)
  from public;

grant execute on function public.get_related_published_blogs(text, integer)
  to anon, authenticated, service_role;
