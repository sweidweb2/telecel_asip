import { z } from "zod";

import {
  pickSearchParams,
  type RawSearchParams,
} from "@/validations/admin-list-query";

export const ADMIN_PERF_EVENT_TYPES = [
  "layout",
  "page",
  "action",
  "data_read",
  "option_load",
  "mutation",
  "upload",
] as const;

export const ADMIN_PERF_CACHE_STATUSES = [
  "hit",
  "miss",
  "bypass",
  "n_a",
] as const;

export const ADMIN_PERF_PAGE_SIZES = [10, 25, 50, 100] as const;
export const ADMIN_PERF_PAGE_SIZE_VALUES = ["10", "25", "50", "100"] as const;
export const ADMIN_PERF_DEFAULT_PAGE_SIZE = 25;
export const ADMIN_PERF_SINCE_HOURS = 24;

const adminPerfListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  pageSize: z
    .enum(ADMIN_PERF_PAGE_SIZE_VALUES)
    .catch("25")
    .transform(
      (value) => Number(value) as (typeof ADMIN_PERF_PAGE_SIZES)[number],
    ),
  search: z
    .string()
    .trim()
    .max(100)
    .regex(/^[^,%_()]*$/)
    .catch(""),
  eventType: z.enum(["all", ...ADMIN_PERF_EVENT_TYPES]).catch("all"),
  cacheStatus: z.enum(["all", ...ADMIN_PERF_CACHE_STATUSES]).catch("all"),
});

export type AdminPerfListQuery = z.infer<typeof adminPerfListQuerySchema>;

export function parseAdminPerfListQuery(
  input: RawSearchParams,
): AdminPerfListQuery {
  return adminPerfListQuerySchema.parse(
    pickSearchParams(input, {
      page: "1",
      pageSize: String(ADMIN_PERF_DEFAULT_PAGE_SIZE),
      search: "",
      eventType: "all",
      cacheStatus: "all",
    }),
  );
}

/** Active list filters preserved across pagination (omit defaults). */
export function adminPerfListFilterParams(
  query: AdminPerfListQuery,
): Record<string, string | undefined> {
  return {
    search: query.search || undefined,
    eventType: query.eventType === "all" ? undefined : query.eventType,
    cacheStatus: query.cacheStatus === "all" ? undefined : query.cacheStatus,
    pageSize:
      query.pageSize !== ADMIN_PERF_DEFAULT_PAGE_SIZE
        ? String(query.pageSize)
        : undefined,
  };
}
