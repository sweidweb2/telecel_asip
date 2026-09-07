-- Local development seed data belongs here.
-- Keep production data and credentials out of this file.
--
-- Seeds a confirmed admin for dashboard testing:
-- email: asweid657@gmail.com
-- password: ali@1234

create extension if not exists pgcrypto with schema extensions;

-- Partners / mentors. Local logos live under /public/partners and are referenced
-- by logo_url. logo_permission must be true for partners_public to expose them.
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
    true,
    '/partners/a2.png',
    null,
    10
  ),
  (
    'ASIP',
    'Telecel Group',
    'media',
    'Programme brand presence across ecosystem events and founder showcases.',
    true,
    true,
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
    true,
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
    true,
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
    true,
    '/partners/der.png',
    null,
    50
  ),
  (
    'DHub',
    null,
    'technology',
    'Digital hub programmes and founder community connections.',
    true,
    true,
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
    true,
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
    true,
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
    true,
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
    true,
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
    true,
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
    true,
    '/partners/miro.png',
    'https://miro.com',
    120
  ),
  (
    'Startupbootcamp AfriTech',
    null,
    'development',
    'Sector programmes and cohort delivery across African markets.',
    true,
    true,
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
    true,
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
  seed_user_id uuid := gen_random_uuid();
  seed_email text := 'asweid657@gmail.com';
  seed_password text := 'ali@1234';
begin
  if exists (select 1 from auth.users where email = seed_email) then
    return;
  end if;

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
    seed_user_id,
    'authenticated',
    'authenticated',
    seed_email,
    extensions.crypt(seed_password, extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
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
    seed_user_id,
    jsonb_build_object(
      'sub', seed_user_id::text,
      'email', seed_email,
      'email_verified', true
    ),
    'email',
    seed_user_id::text,
    now(),
    now(),
    now()
  );
end;
$$;
