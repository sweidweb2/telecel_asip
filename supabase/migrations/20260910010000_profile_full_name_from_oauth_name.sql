-- Google (and some other OAuth providers) put the display name in
-- raw_user_meta_data.name, while email signup uses full_name. Prefer full_name,
-- then fall back to name so OAuth signups get a populated profiles.full_name.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
begin
  requested_role := case new.raw_app_meta_data ->> 'app_role'
    when 'admin' then 'admin'::public.user_role
    when 'editor' then 'editor'::public.user_role
    when 'viewer' then 'viewer'::public.user_role
    else 'viewer'::public.user_role
  end;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      ''
    ),
    requested_role
  );

  return new;
end;
$$;
create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles p
  set
    email = new.email,
    full_name = coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      p.full_name
    )
  where p.id = new.id;

  return new;
end;
$$;
