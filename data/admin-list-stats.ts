import { unstable_cache } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAccessTokenClient } from "@/lib/supabase/editor-access-client";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export type AdminListStatsResource =
  | "blogs"
  | "partners"
  | "startups"
  | "cohorts"
  | "events"
  | "founder_stories"
  | "evidence_records"
  | "impact_metrics"
  | "applications"
  | "interest_registrations"
  | "investor_interests"
  | "investor_engagements"
  | "contact_messages";

/**
 * Tags the matching CMS write already busts via `revalidateTag` / `cacheTags`.
 */
const LIST_STATS_CACHE_TAG: Record<AdminListStatsResource, string> = {
  blogs: "blogs",
  partners: "partners",
  startups: "startups",
  cohorts: "cohorts",
  events: "events",
  founder_stories: "founder-stories",
  evidence_records: "evidence-records",
  impact_metrics: "impact-metrics",
  applications: "applications",
  interest_registrations: "interest-registrations",
  investor_interests: "investor-interests",
  investor_engagements: "investor-engagements",
  contact_messages: "contact-messages",
};

const LIST_STATS_REVALIDATE_SECONDS = 60;

/** Missing RPC. Thrown so the empty card values are not stored for the TTL. */
class ListStatsUnavailableError extends Error {
  constructor() {
    super("get_admin_list_stats is not available");
    this.name = "ListStatsUnavailableError";
  }
}

function asInt(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export function mapAdminListStats<K extends string>(
  payload: unknown,
  keys: readonly K[],
): Record<K, number> {
  const raw =
    payload !== null && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};

  const stats = {} as Record<K, number>;
  for (const key of keys) {
    stats[key] = asInt(raw[key]);
  }
  return stats;
}

type ListStatsCaller = {
  rpc: ServerClient["rpc"];
  auth?: {
    getSession?: () => Promise<{
      data: { session: { access_token?: string } | null };
    }>;
  };
};

async function loadListStatsPayload(
  supabase: Pick<ListStatsCaller, "rpc">,
  resource: AdminListStatsResource,
): Promise<unknown> {
  const { data, error } = await supabase.rpc("get_admin_list_stats", {
    p_resource: resource,
  });

  if (error) {
    if (error.code === "PGRST202") throw new ListStatsUnavailableError();
    throw error;
  }

  return data;
}

async function readCachedListStats(
  accessToken: string,
  resource: AdminListStatsResource,
): Promise<unknown> {
  return unstable_cache(
    () =>
      loadListStatsPayload(createAccessTokenClient(accessToken), resource),
    ["admin-list-stats", resource],
    {
      tags: [LIST_STATS_CACHE_TAG[resource]],
      revalidate: LIST_STATS_REVALIDATE_SECONDS,
    },
  )();
}

/**
 * One RPC for CMS / inbox stat cards (replaces 3–4 exact head counts).
 * Cached per resource. A missing function returns zeros so the list still loads.
 */
export async function fetchAdminListStats<K extends string>(
  supabase: ListStatsCaller,
  resource: AdminListStatsResource,
  keys: readonly K[],
): Promise<Record<K, number>> {
  const session = await supabase.auth?.getSession?.();
  const accessToken = session?.data.session?.access_token;

  try {
    const payload = accessToken
      ? await readCachedListStats(accessToken, resource)
      : await loadListStatsPayload(supabase, resource);
    return mapAdminListStats(payload, keys);
  } catch (error) {
    if (error instanceof ListStatsUnavailableError) {
      return mapAdminListStats(null, keys);
    }
    throw error;
  }
}
