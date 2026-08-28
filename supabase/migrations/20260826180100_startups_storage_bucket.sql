-- Public-read storage bucket for startup logos.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'startups',
  'startups',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do nothing;

create policy "Public can read startup logos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'startups');

create policy "Admins can upload startup logos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'startups' and public.is_admin());

create policy "Admins can update startup logos"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'startups' and public.is_admin())
  with check (bucket_id = 'startups' and public.is_admin());

create policy "Admins can delete startup logos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'startups' and public.is_admin());
