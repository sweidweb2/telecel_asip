-- Defense-in-depth size bounds for the two blog columns that had none.
-- Mirrors BLOG_BODY_MAX / BLOG_CATEGORIES_MAX / BLOG_CATEGORY_MAX in
-- validations/blog.ts, so an unbounded body_html or categories array cannot be
-- stored if a write ever bypasses the Zod layer.

-- CHECK constraints cannot contain subqueries, so per-element category bounds
-- go through an immutable helper.
create or replace function public.blog_categories_within_bounds(categories text[])
returns boolean
language sql
immutable
parallel safe
set search_path = pg_catalog
as $$
  select coalesce(
    bool_and(char_length(category) between 1 and 40),
    true
  )
  from unnest(coalesce(categories, '{}'::text[])) as category;
$$;

alter table public.blogs
  add constraint blogs_body_html_len_chk
    check (char_length(body_html) <= 200000),
  add constraint blogs_categories_count_chk
    check (cardinality(categories) <= 8),
  add constraint blogs_categories_item_len_chk
    check (public.blog_categories_within_bounds(categories));
