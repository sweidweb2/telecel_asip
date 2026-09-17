import { createClient } from "@/lib/supabase/server";

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
  | "contact_messages";

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

/**
 * One RPC for CMS / inbox stat cards (replaces 3–4 exact head counts).
 * Missing function after a pending migration returns zeros so the list still loads.
 */
export async function fetchAdminListStats<K extends string>(
  supabase: ServerClient,
  resource: AdminListStatsResource,
  keys: readonly K[],
): Promise<Record<K, number>> {
  const { data, error } = await supabase.rpc("get_admin_list_stats", {
    p_resource: resource,
  });

  if (error) {
    if (error.code === "PGRST202") return mapAdminListStats(null, keys);
    throw error;
  }

  return mapAdminListStats(data, keys);
}
