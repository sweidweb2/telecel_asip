import type { AdminPerfCacheStatus } from "@/lib/admin/perf/types";

/** Map a 1-based invoke count to a cache hit or miss. */
export function cacheStatusFromInvokeCount(
  invokeCount: number,
): AdminPerfCacheStatus {
  return invokeCount === 1 ? "miss" : "hit";
}
