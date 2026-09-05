import { isAdminPerfTrackingEnabled } from "@/lib/admin/perf";
import { createClient } from "@/lib/supabase/server";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import type { Json } from "@/types/database";
import type {
  AdminPerfCacheStatus,
  AdminPerfEventType,
} from "@/lib/admin/perf";

export type AdminPerfEventRow = {
  id: string;
  created_at: string;
  request_id: string;
  parent_id: string | null;
  event_type: AdminPerfEventType;
  name: string;
  route: string | null;
  duration_ms: number;
  db_ms: number | null;
  cache_status: AdminPerfCacheStatus;
  ok: boolean;
  error_message: string | null;
  meta: Json;
};

export type AdminPerfListFilters = {
  eventType?: AdminPerfEventType | "all";
  cacheStatus?: AdminPerfCacheStatus | "all";
  nameSearch?: string;
  sinceHours?: number;
  limit?: number;
};

export type AdminPerfNameStats = {
  name: string;
  count: number;
  avgMs: number;
  p95Ms: number;
  hitCount: number;
  missCount: number;
  hitAvgMs: number;
  missAvgMs: number;
};

export type AdminPerfAnalytics = {
  total: number;
  hitRatio: number;
  byEventType: { eventType: string; count: number }[];
  slowest: AdminPerfNameStats[];
  overTime: { bucket: string; count: number; hit: number; miss: number }[];
};

const LIST_COLUMNS =
  "id, created_at, request_id, parent_id, event_type, name, route, duration_ms, db_ms, cache_status, ok, error_message, meta" as const;

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[idx] ?? 0;
}

/**
 * Admin-only perf event reads. Never wrap with traceAsync (no recursion).
 */
export async function getAdminPerfEventsPageData(
  filters: AdminPerfListFilters = {},
): Promise<
  | { status: "forbidden" }
  | {
      status: "ok";
      events: AdminPerfEventRow[];
      analytics: AdminPerfAnalytics;
      trackingEnabled: boolean;
    }
> {
  if (!(await isCurrentUserAdmin())) return { status: "forbidden" };

  const trackingEnabled = isAdminPerfTrackingEnabled();
  if (!trackingEnabled) {
    return {
      status: "ok",
      events: [],
      analytics: {
        total: 0,
        hitRatio: 0,
        byEventType: [],
        slowest: [],
        overTime: [],
      },
      trackingEnabled: false,
    };
  }

  const supabase = await createClient();
  const limit = Math.min(filters.limit ?? 200, 500);
  const sinceHours = filters.sinceHours ?? 24;
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000).toISOString();

  let request = supabase
    .from("admin_perf_events")
    .select(LIST_COLUMNS)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.eventType && filters.eventType !== "all") {
    request = request.eq("event_type", filters.eventType);
  }
  if (filters.cacheStatus && filters.cacheStatus !== "all") {
    request = request.eq("cache_status", filters.cacheStatus);
  }
  if (filters.nameSearch?.trim()) {
    request = request.ilike("name", `%${filters.nameSearch.trim()}%`);
  }

  const { data, error } = await request;
  if (error) throw error;

  const events = (data ?? []) as AdminPerfEventRow[];
  return {
    status: "ok",
    events,
    analytics: buildAnalytics(events),
    trackingEnabled: true,
  };
}

export async function getAdminPerfEventsByRequestId(
  requestId: string,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; events: AdminPerfEventRow[] }
> {
  if (!(await isCurrentUserAdmin())) return { status: "forbidden" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_perf_events")
    .select(LIST_COLUMNS)
    .eq("request_id", requestId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) throw error;
  return { status: "ok", events: (data ?? []) as AdminPerfEventRow[] };
}

/** Batch waterfall load for detail dialogs (single query). */
export async function getAdminPerfEventsByRequestIds(
  requestIds: string[],
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; byRequestId: Record<string, AdminPerfEventRow[]> }
> {
  if (!(await isCurrentUserAdmin())) return { status: "forbidden" };
  if (requestIds.length === 0) {
    return { status: "ok", byRequestId: {} };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_perf_events")
    .select(LIST_COLUMNS)
    .in("request_id", requestIds.slice(0, 40))
    .order("created_at", { ascending: true })
    .limit(800);

  if (error) throw error;

  const byRequestId: Record<string, AdminPerfEventRow[]> = {};
  for (const row of (data ?? []) as AdminPerfEventRow[]) {
    const list = byRequestId[row.request_id] ?? [];
    list.push(row);
    byRequestId[row.request_id] = list;
  }
  return { status: "ok", byRequestId };
}

function buildAnalytics(events: AdminPerfEventRow[]): AdminPerfAnalytics {
  const byType = new Map<string, number>();
  const byName = new Map<
    string,
    { all: number[]; hit: number[]; miss: number[] }
  >();
  const byBucket = new Map<string, { count: number; hit: number; miss: number }>();

  let hits = 0;
  let cacheable = 0;

  for (const e of events) {
    byType.set(e.event_type, (byType.get(e.event_type) ?? 0) + 1);

    if (e.cache_status === "hit" || e.cache_status === "miss") {
      cacheable++;
      if (e.cache_status === "hit") hits++;
    }

    const nameBucket = byName.get(e.name) ?? { all: [], hit: [], miss: [] };
    nameBucket.all.push(e.duration_ms);
    if (e.cache_status === "hit") nameBucket.hit.push(e.duration_ms);
    if (e.cache_status === "miss" || e.cache_status === "n_a") {
      nameBucket.miss.push(e.duration_ms);
    }
    byName.set(e.name, nameBucket);

    const hour = e.created_at.slice(0, 13) + ":00";
    const tb = byBucket.get(hour) ?? { count: 0, hit: 0, miss: 0 };
    tb.count++;
    if (e.cache_status === "hit") tb.hit++;
    if (e.cache_status === "miss" || e.cache_status === "n_a") tb.miss++;
    byBucket.set(hour, tb);
  }

  const slowest: AdminPerfNameStats[] = [...byName.entries()]
    .map(([name, buckets]) => {
      const sorted = [...buckets.all].sort((a, b) => a - b);
      const avg = (arr: number[]) =>
        arr.length === 0
          ? 0
          : Math.round((arr.reduce((s, n) => s + n, 0) / arr.length) * 100) /
            100;
      return {
        name,
        count: buckets.all.length,
        avgMs: avg(buckets.all),
        p95Ms: Math.round(percentile(sorted, 95) * 100) / 100,
        hitCount: buckets.hit.length,
        missCount: buckets.miss.length,
        hitAvgMs: avg(buckets.hit),
        missAvgMs: avg(buckets.miss),
      };
    })
    .sort((a, b) => b.missAvgMs - a.missAvgMs || b.avgMs - a.avgMs)
    .slice(0, 12);

  return {
    total: events.length,
    hitRatio: cacheable === 0 ? 0 : Math.round((hits / cacheable) * 1000) / 1000,
    byEventType: [...byType.entries()]
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count),
    slowest,
    overTime: [...byBucket.entries()]
      .map(([bucket, v]) => ({ bucket, ...v }))
      .sort((a, b) => a.bucket.localeCompare(b.bucket)),
  };
}
