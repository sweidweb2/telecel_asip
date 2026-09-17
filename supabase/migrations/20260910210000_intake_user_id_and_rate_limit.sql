-- Bind intake rows to auth users; shared rate-limit RPC for multi-instance deploys.

alter table public.applications
  add column if not exists user_id uuid references auth.users (id) on delete set null;

alter table public.interest_registrations
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists applications_user_id_idx
  on public.applications (user_id)
  where user_id is not null;

create index if not exists interest_registrations_user_id_idx
  on public.interest_registrations (user_id)
  where user_id is not null;

create unique index if not exists applications_user_company_uidx
  on public.applications (user_id, lower(company_name))
  where user_id is not null;

create unique index if not exists interest_registrations_user_company_uidx
  on public.interest_registrations (user_id, lower(company_name))
  where user_id is not null;

create table if not exists public.rate_limit_buckets (
  bucket_key text primary key,
  hits bigint[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.rate_limit_buckets enable row level security;

revoke all on table public.rate_limit_buckets from anon, authenticated;
grant all on table public.rate_limit_buckets to service_role;

comment on table public.rate_limit_buckets is
  'Sliding-window rate limit hits (epoch ms). Service-role / security definer only.';

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_ms integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now bigint := (extract(epoch from clock_timestamp()) * 1000)::bigint;
  v_cutoff bigint;
  v_hits bigint[];
  v_kept bigint[];
begin
  if p_key is null or length(trim(p_key)) = 0 then
    return false;
  end if;
  if p_limit is null or p_limit < 1 or p_window_ms is null or p_window_ms < 1 then
    return false;
  end if;

  v_cutoff := v_now - p_window_ms;

  insert into public.rate_limit_buckets (bucket_key, hits, updated_at)
  values (p_key, '{}'::bigint[], now())
  on conflict (bucket_key) do nothing;

  select hits into v_hits
  from public.rate_limit_buckets
  where bucket_key = p_key
  for update;

  select coalesce(array_agg(h order by h), '{}'::bigint[])
  into v_kept
  from unnest(coalesce(v_hits, '{}'::bigint[])) as h
  where h > v_cutoff;

  if coalesce(array_length(v_kept, 1), 0) >= p_limit then
    update public.rate_limit_buckets
    set hits = v_kept, updated_at = now()
    where bucket_key = p_key;
    return false;
  end if;

  update public.rate_limit_buckets
  set hits = v_kept || v_now, updated_at = now()
  where bucket_key = p_key;

  return true;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer)
  to service_role;

comment on function public.consume_rate_limit(text, integer, integer) is
  'Atomically records a hit when under limit; returns true if allowed. Service role only.';
