import {
  adminListRange,
  adminListTotalPages,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import {
  isAdminPerfTrackingEnabled,
  type AdminPerfCacheStatus,
  type AdminPerfEventType,
} from "@/lib/admin/perf";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import {
  ADMIN_PERF_ANALYTICS_LIMIT,
  ADMIN_PERF_SINCE_HOURS,
  type AdminPerfListQuery,
} from "@/validations/admin-perf-events";

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

type AdminPerfAnalyticsRow = {
  event_type: AdminPerfEventType;
  name: string;
  duration_ms: number;
  cache_status: AdminPerfCacheStatus;
  created_at: string;
};

export type AdminPerfEventsListResult = {
  events: AdminPerfEventRow[];
  total: number;
  totalPages: number;
};

const LIST_COLUMNS =
  "id, created_at, request_id, parent_id, event_type, name, route, duration_ms, db_ms, cache_status, ok, error_message, meta" as const;

const ANALYTICS_COLUMNS =
  "event_type, name, duration_ms, cache_status, created_at" as const;

const EMPTY_ANALYTICS: AdminPerfAnalytics = {
  total: 0,
  hitRatio: 0,
  byEventType: [],
  slowest: [],
  overTime: [],
};

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((p / 100) * sorted.length) - 1),
  );
  return sorted[idx] ?? 0;
}

type ServerClient = Awaited<ReturnType<typeof createClient>>;

function sinceIso(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

async function fetchPerfEventPage(
  supabase: ServerClient,
  query: AdminPerfListQuery,
  since: string,
): Promise<AdminPerfEventsListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("admin_perf_events")
    .select(LIST_COLUMNS, { count: "exact" })
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (query.eventType !== "all") {
    request = request.eq("event_type", query.eventType);
  }
  if (query.cacheStatus !== "all") {
    request = request.eq("cache_status", query.cacheStatus);
  }
  if (query.search) {
    request = request.ilike("name", `%${escapeIlikePattern(query.search)}%`);
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    events: (data ?? []) as AdminPerfEventRow[],
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

async function fetchPerfAnalytics(
  supabase: ServerClient,
  since: string,
): Promise<AdminPerfAnalytics> {
  const { data, count, error } = await supabase
    .from("admin_perf_events")
    .select(ANALYTICS_COLUMNS, { count: "exact" })
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(ADMIN_PERF_ANALYTICS_LIMIT);

  if (error) throw error;

  const rows = (data ?? []) as AdminPerfAnalyticsRow[];
  return buildAnalytics(rows, count ?? rows.length);
}

/**
 * Admin-only perf event reads. Never wrap with traceAsync (no recursion).
 */
export async function getAdminPerfEventsPageData(
  query: AdminPerfListQuery,
): Promise<
  | { status: "forbidden" }
  | {
      status: "ok";
      list: AdminPerfEventsListResult;
      analytics: AdminPerfAnalytics;
      trackingEnabled: boolean;
    }
> {
  if (!(await isCurrentUserAdmin())) return { status: "forbidden" };

  const trackingEnabled = isAdminPerfTrackingEnabled();
  if (!trackingEnabled) {
    return {
      status: "ok",
      list: { events: [], total: 0, totalPages: 1 },
      analytics: EMPTY_ANALYTICS,
      trackingEnabled: false,
    };
  }

  const supabase = await createClient();
  const since = sinceIso(ADMIN_PERF_SINCE_HOURS);
  const [list, analytics] = await Promise.all([
    fetchPerfEventPage(supabase, query, since),
    fetchPerfAnalytics(supabase, since),
  ]);

  return {
    status: "ok",
    list,
    analytics,
    trackingEnabled: true,
  };
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
    .in("request_id", requestIds.slice(0, 100))
    .order("created_at", { ascending: true })
    .limit(2000);

  if (error) throw error;

  const byRequestId: Record<string, AdminPerfEventRow[]> = {};
  for (const row of (data ?? []) as AdminPerfEventRow[]) {
    const list = byRequestId[row.request_id] ?? [];
    list.push(row);
    byRequestId[row.request_id] = list;
  }
  return { status: "ok", byRequestId };
}

function buildAnalytics(
  events: AdminPerfAnalyticsRow[],
  windowTotal: number,
): AdminPerfAnalytics {
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
    total: windowTotal,
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
