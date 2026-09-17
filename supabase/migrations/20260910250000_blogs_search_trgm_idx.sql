-- Speed up CMS blog ILIKE search (title / author), matching inbox/partners/startups trgm pattern.

create index if not exists blogs_title_trgm_idx
  on public.blogs using gin (title extensions.gin_trgm_ops);

create index if not exists blogs_author_name_trgm_idx
  on public.blogs using gin (author_name extensions.gin_trgm_ops);
