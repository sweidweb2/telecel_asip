import { cache } from "react";

import { escapeIlikePattern } from "@/lib/admin/escape-ilike";
import { createClient } from "@/lib/supabase/server";
import type {
  EvidenceOption,
  ImpactMetric,
  ImpactMetricListItem,
  ImpactMetricListResult,
} from "@/types/impact-metric";
import {
  impactMetricIdSchema,
  type ImpactMetricListQuery,
} from "@/validations/impact-metric";

export const IMPACT_METRICS_CACHE_TAG = "impact-metrics";

const LIST_COLUMNS =
  "id, claim_label, value, unit, period_start, period_end, geography, impact_lens, display_locations, evidence_id, publish_status, created_at, updated_at, evidence_records(primary_source)" as const;

const DETAIL_COLUMNS =
  "id, claim_label, value, unit, period_start, period_end, geography, impact_lens, display_locations, evidence_id, publish_status, created_at, updated_at" as const;

const EVIDENCE_OPTION_COLUMNS = "id, primary_source, status" as const;

/** Upper bound so the evidence Select stays bounded. */
const EVIDENCE_OPTIONS_LIMIT = 500;

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
  const from = (query.page - 1) * query.pageSize;
  const to = from + query.pageSize - 1;

  let request = supabase
    .from("impact_metrics")
    .select(LIST_COLUMNS, { count: "exact" })
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
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export async function getImpactMetricsPageData(
  query: ImpactMetricListQuery,
): Promise<
  { status: "forbidden" } | { status: "ok"; list: ImpactMetricListResult }
> {
  const supabase = await createClient();

  const [adminResult, list] = await Promise.all([
    supabase.rpc("is_admin"),
    fetchImpactMetricsPage(supabase, query),
  ]);

  if (adminResult.error) throw adminResult.error;
  if (!adminResult.data) return { status: "forbidden" };

  return { status: "ok", list };
}

type ImpactMetricDetailResult =
  | { status: "forbidden" }
  | { status: "not_found" }
  | { status: "ok"; metric: ImpactMetric };

/**
 * Deduped per request: `generateMetadata` and the page body both need the same
 * metric.
 */
export const getImpactMetricByIdForAdmin = cache(
  async (id: string): Promise<ImpactMetricDetailResult> => {
    if (!impactMetricIdSchema.safeParse(id).success) {
      return { status: "not_found" };
    }

    const supabase = await createClient();
    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
    if (adminError) throw adminError;
    if (!isAdmin) return { status: "forbidden" };

    const { data, error } = await supabase
      .from("impact_metrics")
      .select(DETAIL_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { status: "not_found" };

    return { status: "ok", metric: data as ImpactMetric };
  },
);

/**
 * Evidence options for the metric form Select. Admin-gated; does not own
 * Phase 1 evidence CRUD.
 */
export async function listEvidenceOptionsForAdmin(): Promise<
  { status: "forbidden" } | { status: "ok"; options: EvidenceOption[] }
> {
  const supabase = await createClient();
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) throw adminError;
  if (!isAdmin) return { status: "forbidden" };

  const { data, error } = await supabase
    .from("evidence_records")
    .select(EVIDENCE_OPTION_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(EVIDENCE_OPTIONS_LIMIT);

  if (error) throw error;

  return {
    status: "ok",
    options: (data ?? []) as EvidenceOption[],
  };
}
