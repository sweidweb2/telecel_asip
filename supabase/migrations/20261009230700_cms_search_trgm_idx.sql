-- CMS ILIKE search: newsletter (grows), cohort label, blog slug.
-- pg_trgm is already installed. Impact value/geography and perf event name stay unindexed.

create index if not exists newsletter_subscribers_email_trgm_idx
  on public.newsletter_subscribers using gin (email extensions.gin_trgm_ops);

create index if not exists newsletter_subscribers_source_page_trgm_idx
  on public.newsletter_subscribers using gin (source_page extensions.gin_trgm_ops);

create index if not exists cohorts_public_label_trgm_idx
  on public.cohorts using gin (public_label extensions.gin_trgm_ops);

create index if not exists blogs_slug_trgm_idx
  on public.blogs using gin (slug extensions.gin_trgm_ops);
