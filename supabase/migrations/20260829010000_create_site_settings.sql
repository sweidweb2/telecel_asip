-- Single-row settings table for site-wide switches controlled from the
-- admin dashboard. `open_applications` decides whether the public CTA sends
-- founders to /apply (cohort open) or /register-interest (cohort not open).

create table public.site_settings (
  id smallint primary key default 1,
  open_applications boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton_chk check (id = 1)
);

create or replace function public.set_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row
  execute function public.set_site_settings_updated_at();

insert into public.site_settings (id, open_applications)
values (1, false)
on conflict (id) do nothing;

alter table public.site_settings enable row level security;

grant select on table public.site_settings to anon, authenticated;
grant update on table public.site_settings to authenticated;
grant select, insert, update, delete on table public.site_settings to service_role;

-- Readable by everyone: the navbar CTA and middleware routing depend on it.
create policy "Anyone can read site settings"
  on public.site_settings for select
  to anon, authenticated
  using (true);

-- Singleton row: admins may only update it, never insert or delete.
create policy "Admins can update site settings"
  on public.site_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
