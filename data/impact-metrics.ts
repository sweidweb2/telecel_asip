import { cache } from "react";
import { unstable_cache } from "next/cache";

import { fetchAdminListStats } from "@/data/admin-list-stats";
import {
  adminListRange,
  adminListTotalPages,
} from "@/lib/admin/admin-list-query";
import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { wrapCached, traceAsync } from "@/lib/admin/perf";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type {
  EvidenceOption,
  ImpactMetric,
  ImpactMetricListItem,
  ImpactMetricListResult,
  ImpactMetricPublicItem,
} from "@/types/impact-metric";
import {
  impactMetricIdSchema,
  type ImpactMetricListQuery,
} from "@/validations/impact-metric";

export const IMPACT_METRICS_CACHE_TAG = "impact-metrics";

const LIST_COLUMNS =
  "id, claim_label, value, unit, impact_lens, evidence_id, publish_status, updated_at, evidence_records(primary_source)" as const;

const DETAIL_COLUMNS =
  "id, claim_label, value, unit, period_start, period_end, geography, impact_lens, display_locations, evidence_id, publish_status, created_at, updated_at, evidence_records(primary_source)" as const;

const PUBLIC_COLUMNS =
  "id, claim_label, value, unit, impact_lens, display_locations, updated_at" as const;

const EVIDENCE_OPTION_COLUMNS = "id, primary_source, status" as const;

/** Upper bound so the evidence Select stays bounded. */
const EVIDENCE_OPTIONS_LIMIT = 100;

/** Cap public verified list so anon reads stay bounded. */
const PUBLIC_LIMIT = 100;

type ServerClient = Awaited<ReturnType<typeof createClient>>;

type ListRow = Omit<ImpactMetricListItem, "evidence_primary_source"> & {
  evidence_records: { primary_source: string } | null;
};

function toListItem(row: ListRow): ImpactMetricListItem {
  const { evidence_records, ...rest } = row;
  return {
    ...rest,
    evidence_primary_source: evidence_records?.primary_source ?? null,
  };
}

async function fetchImpactMetricsPage(
  supabase: ServerClient,
  query: ImpactMetricListQuery,
): Promise<ImpactMetricListResult> {
  const { from, to } = adminListRange(query.page, query.pageSize);

  let request = supabase
    .from("impact_metrics")
    .select(LIST_COLUMNS, { count: "estimated" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(from, to);

  if (query.lens !== "all") {
    request = request.eq("impact_lens", query.lens);
  }

  if (query.publishStatus !== "all") {
    request = request.eq("publish_status", query.publishStatus);
  }

  if (query.search) {
    const pattern = escapeIlikePattern(query.search);
    request = request.or(
      `claim_label.ilike."%${pattern}%",value.ilike."%${pattern}%",geography.ilike."%${pattern}%"`,
    );
  }

  const { data, count, error } = await request;
  if (error) throw error;

  const total = count ?? 0;
  return {
    metrics: ((data ?? []) as ListRow[]).map(toListItem),
    total,
    totalPages: adminListTotalPages(total, query.pageSize),
  };
}

export type ImpactMetricListStats = {
  total: number;
  verified: number;
  pending: number;
  notForPublication: number;
};

async function fetchImpactMetricListStats(
  supabase: ServerClient,
): Promise<ImpactMetricListStats> {
  return fetchAdminListStats(supabase, "impact_metrics", [
    "total",
    "verified",
    "pending",
    "notForPublication",
  ]);
}

export async function getImpactMetricsPageData(
  query: ImpactMetricListQuery,
): Promise<
  | { status: "forbidden" }
  | { status: "ok"; list: ImpactMetricListResult; stats: ImpactMetricListStats }
> {
  return traceAsync(
    "getImpactMetricsPageData",
    { eventType: "data_read", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();

      const [isAdmin, list, stats] = await Promise.all([
        isCurrentUserEditor(),
        fetchImpactMetricsPage(supabase, query),
        fetchImpactMetricListStats(supabase),
      ]);

      if (!isAdmin) return { status: "forbidden" };

      return { status: "ok", list, stats };
    },
  );
}

type ImpactMetricDetailResult =
  | { status: "forbidden" }
  | { status: "not_found" }
  | {
      status: "ok";
      metric: ImpactMetric;
      evidencePrimarySource: string | null;
    };

/**
 * Deduped per request: `generateMetadata` and the page body both need the same
 * metric.
 */
export const getImpactMetricByIdForAdmin = wrapCached(
  "getImpactMetricByIdForAdmin",
  { eventType: "data_read" },
  cache(
    async (id: string): Promise<ImpactMetricDetailResult> => {
      if (!impactMetricIdSchema.safeParse(id).success) {
        return { status: "not_found" };
      }

      const supabase = await createClient();
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

      const { data, error } = await supabase
        .from("impact_metrics")
        .select(DETAIL_COLUMNS)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { status: "not_found" };

      const { evidence_records: _evidenceJoin, ...metric } = data as ImpactMetric & {
        evidence_records: { primary_source: string } | null;
      };

      return {
        status: "ok",
        metric: metric as ImpactMetric,
        evidencePrimarySource: _evidenceJoin?.primary_source ?? null,
      };
    },
  ),
);

/**
 * Evidence options for the metric form Select. Admin-gated; does not own
 * Phase 1 evidence CRUD.
 */
export async function listEvidenceOptionsForAdmin(
  search = "",
  includeEvidenceId?: string | null,
): Promise<
  { status: "forbidden" } | { status: "ok"; options: EvidenceOption[] }
> {
  return traceAsync(
    "listEvidenceOptionsForAdmin",
    { eventType: "option_load", cacheStatus: "n_a" },
    async () => {
      const supabase = await createClient();
      if (!(await isCurrentUserEditor())) return { status: "forbidden" };

      const term = search.trim().slice(0, 100);
      let request = supabase
        .from("evidence_records")
        .select(EVIDENCE_OPTION_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(EVIDENCE_OPTIONS_LIMIT);

      if (term) {
        const pattern = escapeIlikePattern(term);
        request = request.ilike("primary_source", `%${pattern}%`);
      }

      const { data, error } = await request;
      if (error) throw error;

      let options = (data ?? []) as EvidenceOption[];
      if (
        includeEvidenceId &&
        !options.some((row) => row.id === includeEvidenceId)
      ) {
        const included = await supabase
          .from("evidence_records")
          .select(EVIDENCE_OPTION_COLUMNS)
          .eq("id", includeEvidenceId)
          .maybeSingle();
        if (included.error) throw included.error;
        if (included.data) {
          options = [included.data as EvidenceOption, ...options];
        }
      }

      return {
        status: "ok",
        options,
      };
    },
  );
}

async function fetchVerifiedImpactMetrics(): Promise<ImpactMetricPublicItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("impact_metrics")
    .select(PUBLIC_COLUMNS)
    .eq("publish_status", "verified")
    .order("updated_at", { ascending: false })
    .limit(PUBLIC_LIMIT);

  if (error) throw error;
  return (data ?? []) as ImpactMetricPublicItem[];
}

/** Cached verified metrics for Home / Impact marketing. */
export const getVerifiedImpactMetrics = unstable_cache(
  fetchVerifiedImpactMetrics,
  ["verified-impact-metrics"],
  { tags: [IMPACT_METRICS_CACHE_TAG], revalidate: 300 },
);

/** Homepage strip — only metrics tagged `homepage_module_02`. */
export async function getHomeImpactMetrics(): Promise<ImpactMetricPublicItem[]> {
  const metrics = await getVerifiedImpactMetrics();
  return metrics.filter((metric) =>
    metric.display_locations?.includes("homepage_module_02"),
  );
}

/** Impact page — metrics tagged `impact_page`, else all verified. */
export async function getImpactPageMetrics(): Promise<ImpactMetricPublicItem[]> {
  const metrics = await getVerifiedImpactMetrics();
  const tagged = metrics.filter((metric) =>
    metric.display_locations?.includes("impact_page"),
  );
  return tagged.length > 0 ? tagged : metrics;
}
