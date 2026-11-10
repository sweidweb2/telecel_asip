-- Audience account type on profiles: startup | investor | admin.
-- Public signup may choose startup/investor only. Staff admins get type=admin.

create type public.profile_type as enum ('startup', 'investor', 'admin');

alter table public.profiles
  add column type public.profile_type not null default 'startup';

comment on column public.profiles.type is
  'Audience account type. Public signup: startup|investor. Staff role=admin forces admin. Distinct from profiles.role (access).';

create index profiles_type_idx on public.profiles (type);

-- Backfill: existing admins → admin; everyone else stays startup (column default).
update public.profiles
set type = 'admin'::public.profile_type
where role = 'admin';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
  requested_type public.profile_type;
  meta_type text;
begin
  requested_role := case new.raw_app_meta_data ->> 'app_role'
    when 'admin' then 'admin'::public.user_role
    when 'editor' then 'editor'::public.user_role
    when 'viewer' then 'viewer'::public.user_role
    else 'viewer'::public.user_role
  end;

  if requested_role = 'admin' then
    requested_type := 'admin'::public.profile_type;
  else
    meta_type := lower(coalesce(new.raw_user_meta_data ->> 'account_type', ''));
    requested_type := case meta_type
      when 'investor' then 'investor'::public.profile_type
      when 'startup' then 'startup'::public.profile_type
      else 'startup'::public.profile_type
    end;
  end if;

  insert into public.profiles (id, email, full_name, role, type)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      ''
    ),
    requested_role,
    requested_type
  );

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'AFTER INSERT auth.users: create profiles row. Role from app_metadata.app_role (else viewer). Type: admin when role=admin; else user_metadata.account_type startup|investor (default startup).';

-- Block privilege escalation on profiles.type (mirrors role protection).
create or replace function public.prevent_unauthorized_profile_type_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.type is not distinct from old.type then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  -- Editors may only move non-admin audience types on non-admin rows.
  if public.is_editor() then
    if old.type in ('startup', 'investor')
       and new.type in ('startup', 'investor') then
      return new;
    end if;

    raise exception
      'Editors may only change account type between startup and investor'
      using errcode = '42501';
  end if;

  -- Own-profile: startup ↔ investor only.
  if auth.uid() = new.id
     and old.type in ('startup', 'investor')
     and new.type in ('startup', 'investor') then
    return new;
  end if;

  raise exception 'Only administrators can assign the admin account type'
    using errcode = '42501';
end;
$$;

comment on function public.prevent_unauthorized_profile_type_change() is
  'BEFORE UPDATE OF type: admins any; editors startup↔investor; own-profile startup↔investor; admin type blocked for others.';

create trigger profiles_protect_type
  before update of type on public.profiles
  for each row
  execute function public.prevent_unauthorized_profile_type_change();
