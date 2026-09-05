import type { Tables } from "@/types/database";

export type Application = Tables<"applications">;

export type ApplicationListResult = {
  applications: Application[];
  total: number;
  totalPages: number;
};
