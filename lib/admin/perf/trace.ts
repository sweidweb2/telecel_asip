import { isAdminPerfTrackingEnabled } from "@/lib/admin/perf/config";
import { persistAdminPerfEvent } from "@/lib/admin/perf/persist";
import {
  getAdminPerfRequestId,
  getAdminPerfRoute,
  isAdminPerfRouteExcluded,
  setAdminPerfRoute,
} from "@/lib/admin/perf/request-context";
import type {
  AdminPerfCacheStatus,
  AdminPerfEventAttrs,
} from "@/lib/admin/perf/types";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const record = err as { message?: unknown; code?: unknown; details?: unknown };
    const parts = [
      typeof record.message === "string" ? record.message : null,
      typeof record.code === "string" ? `code=${record.code}` : null,
      typeof record.details === "string" ? record.details : null,
    ].filter(Boolean);
    if (parts.length > 0) return parts.join(" | ");
    try {
      return JSON.stringify(err);
    } catch {
      return "unknown_error";
    }
  }
  return String(err);
}

/**
 * Time an async op and queue a perf row. No-op when flag is off or route is
 * the performance dashboard itself. Persistence is never awaited.
 */
export async function traceAsync<T>(
  name: string,
  attrs: AdminPerfEventAttrs,
  fn: () => Promise<T>,
): Promise<T> {
  if (!isAdminPerfTrackingEnabled()) {
    return fn();
  }

  if (attrs.route) setAdminPerfRoute(attrs.route);
  const route = attrs.route ?? getAdminPerfRoute();
  if (isAdminPerfRouteExcluded(route)) {
    return fn();
  }

  const cacheStatus: AdminPerfCacheStatus = attrs.cacheStatus ?? "n_a";
  const started = performance.now();
  let ok = true;
  let errMsg: string | null = null;

  try {
    return await fn();
  } catch (err) {
    ok = false;
    errMsg = errorMessage(err);
    throw err;
  } finally {
    const durationMs = performance.now() - started;
    persistAdminPerfEvent({
      request_id: getAdminPerfRequestId(),
      parent_id: attrs.parentId ?? null,
      event_type: attrs.eventType,
      name,
      route,
      duration_ms: Math.round(durationMs * 100) / 100,
      db_ms: null,
      cache_status: cacheStatus,
      ok,
      error_message: errMsg,
      meta: attrs.meta ?? {},
    });
  }
}
