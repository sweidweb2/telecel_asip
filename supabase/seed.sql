-- Local development seed data belongs here.
-- Keep production data and credentials out of this file.
--
-- Seed accounts (local only — not for production):
--   Admin:  asweid657@gmail.com / ali@1234 → /admin
--   Editor: gbitar@telecelglobal.com / password → /dashboard
-- Evidence ownership is reassigned to the editor after seed.

create extension if not exists pgcrypto with schema extensions;

-- Partners / mentors. Local logos live under /public/partners and are referenced
-- by logo_url. logo_permission stays false until written usage permission is on file.
-- partners_public only exposes a logo when that flag is true.
-- Amina Diallo has no logo file — name-tile fallback for admin/public testing.
insert into public.partners (
  name,
  org,
  type,
  contribution,
  is_active,
  logo_permission,
  logo_url,
  link,
  sort_order
)
values
  (
    'Accelerator²',
    null,
    'corporate',
    'Corporate innovation briefs and pilots with ASIP founders.',
    true,
    false,
    '/partners/a2.png',
    null,
    10
  ),
  (
    'ASIP',
    'Telecel Group',
    'media',
    'Program brand presence across ecosystem events and founder showcases.',
    true,
    false,
    '/partners/asip.png',
    null,
    20
  ),
  (
    'AWS',
    'Amazon Web Services',
    'technology',
    'Cloud credits, architecture reviews and technical workshops.',
    true,
    false,
    '/partners/aws.png',
    'https://aws.amazon.com',
    30
  ),
  (
    'Cloudworx',
    null,
    'technology',
    'Cloud and infrastructure expertise for early-stage technical teams.',
    true,
    false,
    '/partners/cloudworx.png',
    null,
    40
  ),
  (
    'DER',
    null,
    'development',
    'Development-sector collaboration and market access pathways.',
    true,
    false,
    '/partners/der.png',
    null,
    50
  ),
  (
    'DHub',
    null,
    'technology',
    'Digital hub programs and founder community connections.',
    true,
    false,
    '/partners/dhub.png',
    null,
    60
  ),
  (
    'Firstbase',
    null,
    'technology',
    'Remote operations tooling for distributed founding teams.',
    true,
    false,
    '/partners/firstbase.png',
    'https://www.firstbase.io',
    70
  ),
  (
    'FMO Ventures',
    'FMO',
    'investors',
    'Investment-readiness dialogue and portfolio introductions.',
    true,
    false,
    '/partners/fmo-ventures.png',
    'https://www.fmo.nl',
    80
  ),
  (
    'Freshworks',
    null,
    'technology',
    'Customer engagement software credits and product workshops.',
    true,
    false,
    '/partners/freshworks.png',
    'https://www.freshworks.com',
    90
  ),
  (
    'Google Cloud',
    'Google',
    'technology',
    'Cloud credits, architecture guidance and technical enablement.',
    true,
    false,
    '/partners/google-cloud.png',
    'https://cloud.google.com',
    100
  ),
  (
    'HubSpot',
    null,
    'technology',
    'CRM and go-to-market tooling for founder commercial teams.',
    true,
    false,
    '/partners/hubspot.png',
    'https://www.hubspot.com',
    110
  ),
  (
    'Miro',
    null,
    'technology',
    'Collaborative workspace access for workshops and cohort delivery.',
    true,
    false,
    '/partners/miro.png',
    'https://miro.com',
    120
  ),
  (
    'Startupbootcamp AfriTech',
    null,
    'development',
    'Sector programs and cohort delivery across African markets.',
    true,
    false,
    '/partners/sbc-afritech.png',
    null,
    130
  ),
  (
    'VC4A',
    null,
    'media',
    'Ecosystem research and founder showcases.',
    false,
    false,
    '/partners/vc4a.png',
    'https://vc4a.com',
    140
  ),
  (
    'Amina Diallo',
    null,
    'mentors',
    '1:1 mentoring on go-to-market and early commercial traction.',
    true,
    false,
    null,
    null,
    150
  )
on conflict do nothing;

do $$
declare
  admin_user_id uuid := gen_random_uuid();
  admin_email text := 'asweid657@gmail.com';
  admin_password text := 'ali@1234';
  editor_user_id uuid := gen_random_uuid();
  editor_email text := 'gbitar@telecelglobal.com';
  editor_password text := 'password';
begin
  if not exists (select 1 from auth.users where email = admin_email) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      admin_user_id,
      'authenticated',
      'authenticated',
      admin_email,
      extensions.crypt(admin_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"],"app_role":"admin"}'::jsonb,
      '{"full_name":"ASIP Admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      admin_user_id,
      jsonb_build_object(
        'sub', admin_user_id::text,
        'email', admin_email,
        'email_verified', true
      ),
      'email',
      admin_user_id::text,
      now(),
      now(),
      now()
    );
  end if;

  update public.profiles
  set role = 'admin'
  where email = admin_email
    and role is distinct from 'admin';

  if not exists (select 1 from auth.users where email = editor_email) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      editor_user_id,
      'authenticated',
      'authenticated',
      editor_email,
      extensions.crypt(editor_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"],"app_role":"editor"}'::jsonb,
      '{"full_name":"ASIP Editor"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      editor_user_id,
      jsonb_build_object(
        'sub', editor_user_id::text,
        'email', editor_email,
        'email_verified', true
      ),
      'email',
      editor_user_id::text,
      now(),
      now(),
      now()
    );
  end if;

  update public.profiles
  set role = 'editor'
  where email = editor_email
    and role is distinct from 'editor';

  update public.evidence_records
  set owner_id = p.id
  from public.profiles p
  where p.email = editor_email
    and evidence_records.owner_id is distinct from p.id;
end;
$$;
