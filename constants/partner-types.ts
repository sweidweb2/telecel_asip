import type { PartnerType } from "@/types/partner";

/**
 * Admin-facing labels. Public pages use the bilingual `types.rows` entries in
 * `constants/partners-copy.ts`, keyed by the same ids.
 */
export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  corporate: "Corporate innovation",
  investors: "Investors",
  technology: "Technology partners",
  development: "Development / public sector",
  mentors: "Mentors / operators",
  media: "Media / ecosystem",
};
