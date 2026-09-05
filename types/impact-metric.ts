import type { Enums, Tables } from "@/types/database";

export type ImpactLens = Enums<"impact_lens">;
export type ImpactPublishStatus = Enums<"evidence_status">;

export type ImpactMetric = Tables<"impact_metrics">;

/** Lean list row — table columns only. */
export type ImpactMetricListItem = Pick<
  ImpactMetric,
  | "id"
  | "claim_label"
  | "value"
  | "unit"
  | "impact_lens"
  | "evidence_id"
  | "publish_status"
  | "updated_at"
> & {
  /** Joined from `evidence_records.primary_source` for admin table display. */
  evidence_primary_source: string | null;
};

export type ImpactMetricListResult = {
  metrics: ImpactMetricListItem[];
  total: number;
  totalPages: number;
};

/** Narrow row for the evidence Select on the impact metric form. */
export type EvidenceOption = {
  id: string;
  primary_source: string;
  status: ImpactPublishStatus;
};

/** Verified metrics safe for marketing (Home / Impact). */
export type ImpactMetricPublicItem = Pick<
  ImpactMetric,
  | "id"
  | "claim_label"
  | "value"
  | "unit"
  | "impact_lens"
  | "display_locations"
  | "updated_at"
>;
