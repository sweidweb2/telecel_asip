-- Speed up admin substring search on slug (name already has gin_trgm).

create index startups_slug_trgm_idx
  on public.startups using gin (slug extensions.gin_trgm_ops);
