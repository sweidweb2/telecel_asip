-- Editors manage editor/viewer accounts only — they must not see or mutate
-- administrator profiles in the shared Users list (defense-in-depth with app UI).
-- Admins keep full access via is_admin(). Own-profile policies are unchanged.

alter policy "Admins can read all profiles"
  on public.profiles
  using (
    public.is_admin()
    or (public.is_editor() and role <> 'admin')
  );

alter policy "Admins can update all profiles"
  on public.profiles
  using (
    public.is_admin()
    or (public.is_editor() and role <> 'admin')
  )
  with check (
    public.is_admin()
    or (public.is_editor() and role <> 'admin')
  );
