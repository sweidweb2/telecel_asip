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

export type AdminPerfEventsListResult = {
  events: AdminPerfEventRow[];
  total: number;
  totalPages: number;
};

const LIST_COLUMNS =
  "id, created_at, request_id, parent_id, event_type, name, route, duration_ms, db_ms, cache_status, ok, error_message, meta" as const;

const EMPTY_ANALYTICS: AdminPerfAnalytics = {
  total: 0,
  hitRatio: 0,
  byEventType: [],
  slowest: [],
  overTime: [],
};

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
    .select(LIST_COLUMNS, { count: "estimated" })
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
  const { data, error } = await supabase.rpc("get_admin_perf_analytics", {
    p_since: since,
  });

  if (error) throw error;
  return mapAdminPerfAnalytics(data);
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

function asNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asRows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    const record = asRecord(row);
    return record ? [record] : [];
  });
}

/** Maps `get_admin_perf_analytics` jsonb into the chart shape. */
export function mapAdminPerfAnalytics(payload: unknown): AdminPerfAnalytics {
  const raw = asRecord(payload);
  if (!raw) return EMPTY_ANALYTICS;

  return {
    total: asNumber(raw.total),
    hitRatio: asNumber(raw.hitRatio),
    byEventType: asRows(raw.byEventType).map((row) => ({
      eventType: typeof row.eventType === "string" ? row.eventType : "",
      count: asNumber(row.count),
    })),
    slowest: asRows(raw.slowest).map((row) => ({
      name: typeof row.name === "string" ? row.name : "",
      count: asNumber(row.count),
      avgMs: asNumber(row.avgMs),
      p95Ms: asNumber(row.p95Ms),
      hitCount: asNumber(row.hitCount),
      missCount: asNumber(row.missCount),
      hitAvgMs: asNumber(row.hitAvgMs),
      missAvgMs: asNumber(row.missAvgMs),
    })),
    overTime: asRows(raw.overTime).map((row) => ({
      bucket: typeof row.bucket === "string" ? row.bucket : "",
      count: asNumber(row.count),
      hit: asNumber(row.hit),
      miss: asNumber(row.miss),
    })),
  };
}
