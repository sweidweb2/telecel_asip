import type { Tables } from "@/types/database";

export type Application = Tables<"applications">;

/** Columns shown on the inbox table (no essay fields). */
export type ApplicationListItem = Pick<
  Application,
  | "id"
  | "full_name"
  | "email"
  | "company_name"
  | "inbox_status"
  | "created_at"
>;

export type ApplicationListResult = {
  applications: ApplicationListItem[];
  total: number;
  totalPages: number;
};
