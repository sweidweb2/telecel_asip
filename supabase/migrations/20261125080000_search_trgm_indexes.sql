-- ILIKE search indexes for investor inbox, impact metrics, and public portfolio.

create index if not exists investor_interests_full_name_trgm_idx
  on public.investor_interests using gin (full_name extensions.gin_trgm_ops);

create index if not exists investor_interests_email_trgm_idx
  on public.investor_interests using gin (email extensions.gin_trgm_ops);

create index if not exists investor_interests_organization_trgm_idx
  on public.investor_interests using gin (organization extensions.gin_trgm_ops);

create index if not exists investor_engagements_full_name_trgm_idx
  on public.investor_engagements using gin (full_name extensions.gin_trgm_ops);

create index if not exists investor_engagements_email_trgm_idx
  on public.investor_engagements using gin (email extensions.gin_trgm_ops);

create index if not exists investor_engagements_organization_trgm_idx
  on public.investor_engagements using gin (organization extensions.gin_trgm_ops);

create index if not exists impact_metrics_value_trgm_idx
  on public.impact_metrics using gin (value extensions.gin_trgm_ops);

create index if not exists impact_metrics_geography_trgm_idx
  on public.impact_metrics using gin (geography extensions.gin_trgm_ops)
  where geography is not null;

create index if not exists startups_description_trgm_idx
  on public.startups using gin (description extensions.gin_trgm_ops);
