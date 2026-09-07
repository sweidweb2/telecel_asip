-- Cap partners.sort_order to 1–170 (was 0–10000).
-- Clamp existing rows first so the new CHECK can apply.

update public.partners
set sort_order = 1
where sort_order < 1;

update public.partners
set sort_order = 170
where sort_order > 170;

alter table public.partners
  alter column sort_order set default 1;

alter table public.partners
  drop constraint if exists partners_sort_order_chk;

alter table public.partners
  add constraint partners_sort_order_chk
  check (sort_order between 1 and 170);
