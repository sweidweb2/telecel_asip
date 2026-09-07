-- Defense-in-depth: published stories may omit a quote, but a non-empty quote
-- must have quote_permission_status = granted (matches app Zod gate).

alter table public.founder_stories
  add constraint founder_stories_published_quote_granted_chk
  check (
    publish_status <> 'published'
    or founder_quote_text is null
    or btrim(founder_quote_text) = ''
    or quote_permission_status = 'granted'
  );
