-- Keep public.profiles identity in step with auth.users.
--
-- The admin Users screen edits identity through the Auth Admin API and then had
-- to write public.profiles separately; a failure between the two left the login
-- email different from the CMS email. This trigger runs inside the same
-- transaction as the auth.users write, so the two can no longer diverge.
--
-- `role` is deliberately NOT synced here: public.prevent_unauthorized_profile_role_change
-- calls is_admin(), which reads auth.uid(). On the GoTrue connection auth.uid()
-- is null, so a role change from this trigger would raise 42501. Role lives only
-- in profiles and is still written by the admin session client.

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
      p.full_name
    )
  where p.id = new.id;

  return new;
end;
$$;

revoke all on function public.handle_auth_user_updated()
  from public, anon, authenticated;

create trigger on_auth_user_updated
  after update of email, raw_user_meta_data on auth.users
  for each row
  execute function public.handle_auth_user_updated();
