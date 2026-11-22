import type { Tables } from "@/types/database";

export type InvestorEngagement = Tables<"investor_engagements">;

/** Columns shown on the inbox table (no thesis / message). */
export type InvestorEngagementListItem = Pick<
  InvestorEngagement,
  | "id"
  | "full_name"
  | "email"
  | "organization"
  | "inbox_status"
  | "created_at"
>;

export type InvestorEngagementListResult = {
  engagements: InvestorEngagementListItem[];
  total: number;
  totalPages: number;
};
