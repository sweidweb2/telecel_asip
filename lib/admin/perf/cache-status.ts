import type { AdminPerfCacheStatus } from "@/lib/admin/perf/types";

/** Pure helper — same hit/miss rule as wrapCached (safe for Vitest). */
export function cacheStatusFromInvokeCount(
  invokeCount: number,
): AdminPerfCacheStatus {
  return invokeCount === 1 ? "miss" : "hit";
}
