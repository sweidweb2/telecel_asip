import type { ImpactLens, ImpactPublishStatus } from "@/types/impact-metric";

/** Admin-facing labels for `impact_lens`. */
export const IMPACT_LENS_LABELS: Record<ImpactLens, string> = {
  pipeline: "Pipeline",
  inclusion: "Inclusion",
  business_growth: "Business growth",
  commercialisation: "Commercialisation",
  jobs_capability: "Jobs & capability",
  sector_outcomes: "Sector outcomes",
};

/** Admin-facing labels for `publish_status` (`evidence_status`). */
export const IMPACT_PUBLISH_STATUS_LABELS: Record<ImpactPublishStatus, string> =
  {
    verified: "Verified",
    pending: "Pending",
    outdated: "Outdated",
    disputed: "Disputed",
    not_for_publication: "Not for publication",
  };
