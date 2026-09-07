import type { Tables } from "@/types/database";

export type CohortProgrammeStatus = "closed" | "open" | "hold";
export type CmsPublishStatus = "draft" | "published";

export type Cohort = Tables<"cohorts">;

export type CohortListItem = Pick<
  Cohort,
  | "id"
  | "year"
  | "public_label"
  | "programme_dates_start"
  | "programme_dates_end"
  | "programme_status"
  | "publish_status"
  | "created_at"
  | "updated_at"
>;

export type CohortAdminDetail = Cohort & {
  partnerIds: string[];
  startupIds: string[];
};

export type CohortLinkOption = {
  id: string;
  name: string;
};

export type CohortListResult = {
  cohorts: CohortListItem[];
  total: number;
  totalPages: number;
};

export type CohortPublicListItem = Pick<
  Cohort,
  | "id"
  | "year"
  | "public_label"
  | "programme_dates_start"
  | "programme_dates_end"
  | "programme_status"
  | "summary"
  | "media_url"
  | "updated_at"
>;
