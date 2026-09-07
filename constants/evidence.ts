export type ApprovalStatus = "pending" | "approved" | "rejected";
export type EvidenceVisibility = "public" | "internal" | "confidential";

export type EvidenceMetric = {
  id: string;
  value: string;
  label: { en: string; fr: string };
  sourceDocument: string;
  sourcePage: number;
  measurementPeriod: string;
  owner: string;
  approvalStatus: ApprovalStatus;
  visibility: EvidenceVisibility;
  lastVerifiedAt: string | null;
};

export function publicApprovedEvidence(metrics: EvidenceMetric[]) {
  return metrics.filter(
    (metric) => metric.approvalStatus === "approved" && metric.visibility === "public",
  );
}

export const ASIP_EVIDENCE: EvidenceMetric[] = [
  { id: "startups-supported", value: "42", label: { en: "startups supported", fr: "startups accompagnees" }, sourceDocument: "ASIP Accelerator Cohort 4 Report EN", sourcePage: 7, measurementPeriod: "Cohorts 1-4", owner: "Telecel Group", approvalStatus: "pending", visibility: "internal", lastVerifiedAt: null },
  { id: "jobs", value: "9,600", label: { en: "jobs", fr: "emplois" }, sourceDocument: "ASIP Accelerator Cohort 4 Report EN", sourcePage: 8, measurementPeriod: "Through Cohort 4", owner: "Telecel Group", approvalStatus: "pending", visibility: "internal", lastVerifiedAt: null },
  { id: "contracts", value: "$13m", label: { en: "commercial contracts", fr: "contrats commerciaux" }, sourceDocument: "ASIP Accelerator Cohort 4 Report EN", sourcePage: 8, measurementPeriod: "Through Cohort 4", owner: "Telecel Group", approvalStatus: "pending", visibility: "internal", lastVerifiedAt: null },
];
