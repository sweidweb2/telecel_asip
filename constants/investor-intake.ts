/** Shared enums / option lists for investor Register Interest + Apply forms. */

/** Cache tags for investor intake rows (admin inbox + public submit). */
export const INVESTOR_INTEREST_CACHE_TAGS = ["investor-interests"] as const;
export const INVESTOR_ENGAGEMENT_CACHE_TAGS = ["investor-engagements"] as const;


export const INVESTOR_KINDS = [
  "angel",
  "vc",
  "corporate",
  "dfi",
  "family_office",
  "other",
] as const;

export const INVESTOR_STAGES = [
  "pre_seed",
  "seed",
  "series_a",
  "growth",
] as const;

export const INVESTOR_TICKET_SIZES = [
  "under_50k",
  "50k_250k",
  "250k_1m",
  "1m_plus",
  "undisclosed",
] as const;

export const INVESTOR_ENGAGEMENT_INTENTS = [
  "portfolio_access",
  "introductions",
  "co_invest",
  "pilot_partnership",
  "mentorship",
  "other",
] as const;

export const INVESTOR_TIMELINES = [
  "exploring",
  "this_quarter",
  "this_year",
] as const;

export const INVESTOR_SECTOR_OPTIONS = [
  "FinTech",
  "HealthTech",
  "AgriTech",
  "EdTech",
  "InsurTech",
  "CleanTech",
  "eCommerce",
  "Logistics",
  "Mobility",
  "Other",
] as const;

export const INVESTOR_GEOGRAPHY_OPTIONS = [
  "West Africa",
  "East Africa",
  "Southern Africa",
  "North Africa",
  "Central Africa",
  "Pan-African",
  "Diaspora / Global",
] as const;

export type InvestorKind = (typeof INVESTOR_KINDS)[number];
export type InvestorStage = (typeof INVESTOR_STAGES)[number];
export type InvestorTicketSize = (typeof INVESTOR_TICKET_SIZES)[number];
export type InvestorEngagementIntent =
  (typeof INVESTOR_ENGAGEMENT_INTENTS)[number];
export type InvestorTimeline = (typeof INVESTOR_TIMELINES)[number];
