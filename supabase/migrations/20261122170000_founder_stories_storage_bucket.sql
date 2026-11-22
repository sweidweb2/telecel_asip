-- Public-read storage bucket for founder story / Impact case-study covers.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'founder-stories',
  'founder-stories',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do nothing;

create policy "Public can read founder story covers"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'founder-stories');

create policy "Editors can upload founder story covers"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'founder-stories' and public.is_editor());

create policy "Editors can update founder story covers"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'founder-stories' and public.is_editor())
  with check (bucket_id = 'founder-stories' and public.is_editor());

create policy "Editors can delete founder story covers"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'founder-stories' and public.is_editor());
