import type {
  EvidencePermission,
  EvidenceStatus,
} from "@/types/evidence-record";

export const EVIDENCE_STATUSES = [
  "verified",
  "pending",
  "outdated",
  "disputed",
  "not_for_publication",
] as const satisfies readonly EvidenceStatus[];

export const EVIDENCE_PERMISSIONS = [
  "public",
  "internal_only",
  "partner_approval_required",
  "legal_review_required",
] as const satisfies readonly EvidencePermission[];

export const EVIDENCE_STATUS_LABELS: Record<EvidenceStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  outdated: "Outdated",
  disputed: "Disputed",
  not_for_publication: "Not for publication",
};

export const EVIDENCE_PERMISSION_LABELS: Record<EvidencePermission, string> = {
  public: "Public",
  internal_only: "Internal only",
  partner_approval_required: "Partner approval required",
  legal_review_required: "Legal review required",
};
