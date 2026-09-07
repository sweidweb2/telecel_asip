-- Public-read storage bucket for partner logos.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'partners',
  'partners',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do nothing;

create policy "Public can read partner logos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'partners');

create policy "Admins can upload partner logos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'partners' and public.is_admin());

create policy "Admins can update partner logos"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'partners' and public.is_admin())
  with check (bucket_id = 'partners' and public.is_admin());

create policy "Admins can delete partner logos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'partners' and public.is_admin());
