import type { Enums, Tables } from "@/types/database";

export type EvidenceStatus = Enums<"evidence_status">;
export type EvidencePermission = Enums<"evidence_permission">;

export type EvidenceRecord = Tables<"evidence_records">;

export type EvidenceOwnerOption = {
  id: string;
  email: string;
  full_name: string | null;
};

/** Lean list row — table columns only. */
export type EvidenceListItem = Pick<
  EvidenceRecord,
  | "id"
  | "primary_source"
  | "measurement_period_start"
  | "measurement_period_end"
  | "owner_id"
  | "status"
  | "permission"
> & {
  owner: Pick<EvidenceOwnerOption, "email" | "full_name"> | null;
};

/** Full record for detail / edit. */
export type EvidenceDetail = Pick<
  EvidenceRecord,
  | "id"
  | "primary_source"
  | "source_file_url"
  | "measurement_period_start"
  | "measurement_period_end"
  | "owner_id"
  | "status"
  | "last_verified_date"
  | "permission"
  | "review_date"
  | "created_at"
  | "updated_at"
> & {
  owner: EvidenceOwnerOption | null;
};

export type EvidenceListResult = {
  records: EvidenceListItem[];
  total: number;
  totalPages: number;
};
