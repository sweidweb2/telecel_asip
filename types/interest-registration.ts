import type { Tables } from "@/types/database";

export type InterestRegistration = Tables<"interest_registrations">;

/** Columns shown on the inbox table (no pitch). */
export type InterestRegistrationListItem = Pick<
  InterestRegistration,
  | "id"
  | "full_name"
  | "email"
  | "company_name"
  | "inbox_status"
  | "created_at"
>;

export type InterestRegistrationListResult = {
  registrations: InterestRegistrationListItem[];
  total: number;
  totalPages: number;
};
