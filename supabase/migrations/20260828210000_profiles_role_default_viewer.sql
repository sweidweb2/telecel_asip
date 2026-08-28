-- profiles.role defaulted to 'admin' from the developer-only signup era.
-- handle_new_user() already resolves 'viewer' for public signups, but the column
-- default still hands admin to any insert that omits the column. Least privilege
-- should be the fallback everywhere, so the default moves to 'viewer'.
--
-- Existing rows are untouched: role is set explicitly on every insert path today,
-- and silently demoting live administrators would lock them out of the CMS.

alter table public.profiles
  alter column role set default 'viewer'::public.user_role;
