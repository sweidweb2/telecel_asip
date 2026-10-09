import { cache } from "react";
import { nanoid } from "nanoid";

type PerfRequestStore = {
  requestId: string;
  route: string | null;
  /** Per-op invoke counts. Inner loaders no longer record hit/miss spans. */
  invokeCounts: Map<string, number>;
};

/**
 * Per-request store (React.cache). Shared across layout, pages, and actions
 * in the same RSC / Server Action invocation.
 */
export const getAdminPerfRequestStore = cache((): PerfRequestStore => ({
  requestId: nanoid(16),
  route: null,
  invokeCounts: new Map(),
}));

export function setAdminPerfRoute(route: string | null | undefined) {
  if (!route) return;
  const store = getAdminPerfRequestStore();
  store.route = route;
}

export function getAdminPerfRequestId(): string {
  return getAdminPerfRequestStore().requestId;
}

export function getAdminPerfRoute(): string | null {
  return getAdminPerfRequestStore().route;
}

/** Returns the 1-based invoke count for this cache key within the request. */
export function bumpAdminPerfInvokeCount(cacheKey: string): number {
  const store = getAdminPerfRequestStore();
  const next = (store.invokeCounts.get(cacheKey) ?? 0) + 1;
  store.invokeCounts.set(cacheKey, next);
  return next;
}

export function isAdminPerfRouteExcluded(route: string | null): boolean {
  if (!route) return false;
  return (
    route === "/admin/performance" ||
    route.startsWith("/admin/performance/") ||
    route === "/dashboard/performance" ||
    route.startsWith("/dashboard/performance/")
  );
}
