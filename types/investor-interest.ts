import type { Tables } from "@/types/database";

export type InvestorInterest = Tables<"investor_interests">;

/** Columns shown on the inbox table (no focus note). */
export type InvestorInterestListItem = Pick<
  InvestorInterest,
  | "id"
  | "full_name"
  | "email"
  | "organization"
  | "inbox_status"
  | "created_at"
>;

export type InvestorInterestListResult = {
  interests: InvestorInterestListItem[];
  total: number;
  totalPages: number;
};
