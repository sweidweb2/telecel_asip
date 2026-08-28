-- Least privilege by default.
--
-- The column default dated from the developer-only phase, when every signup was
-- meant to reach the CMS. handle_new_user() has assigned 'viewer' since
-- 20260823082614_users_crud.sql, so this default is only reachable by an INSERT
-- that omits role — where escalating to admin is exactly the wrong outcome.

alter table public.profiles
  alter column role set default 'viewer';
