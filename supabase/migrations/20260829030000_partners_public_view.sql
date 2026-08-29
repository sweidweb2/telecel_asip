-- Move the logo publication gate from the app layer into the database.
--
-- Before this migration `anon` could read every column of public.partners over
-- PostgREST, including the logo_url of partners who never granted publication
-- permission. The marketing page stripped that URL in TypeScript, which is a
-- display convention, not a boundary. Anonymous reads now go through a view
-- that nulls the column, and the base table is closed to anon entirely.

create view public.partners_public as
select
  id,
  name,
  org,
  type,
  link,
  is_active,
  sort_order,
  case when logo_permission then logo_url end as logo_url
from public.partners;

comment on view public.partners_public is
  'Anonymous-readable projection of public.partners. logo_url is null unless logo_permission is granted; logo_permission and contribution are not exposed.';

-- Deliberately NOT security_invoker: anon loses select on the base table below,
-- so an invoker-rights view would return zero rows. Every partner row is public
-- by design, so the definer view leaks no rows the old policy did not already
-- allow — it only removes columns.
revoke select on table public.partners from anon;

drop policy "Anyone can read partners" on public.partners;

create policy "Authenticated can read partners"
  on public.partners
  for select
  to authenticated
  using (true);

grant select on public.partners_public to anon, authenticated;
