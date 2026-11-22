-- Public-read storage bucket for cohort programme media (past-chapters covers).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cohorts',
  'cohorts',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do nothing;

create policy "Public can read cohort media"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'cohorts');

create policy "Editors can upload cohort media"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'cohorts' and public.is_editor());

create policy "Editors can update cohort media"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'cohorts' and public.is_editor())
  with check (bucket_id = 'cohorts' and public.is_editor());

create policy "Editors can delete cohort media"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'cohorts' and public.is_editor());
