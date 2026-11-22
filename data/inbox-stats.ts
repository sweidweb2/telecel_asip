import { fetchAdminListStats } from "@/data/admin-list-stats";
import { createClient } from "@/lib/supabase/server";

export type InboxTableStats = {
  total: number;
  unread: number;
  reviewed: number;
  last7Days: number;
};

export type InboxStatsTable =
  | "applications"
  | "interest_registrations"
  | "investor_interests"
  | "investor_engagements"
  | "contact_messages";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

const INBOX_STAT_KEYS = [
  "total",
  "unread",
  "reviewed",
  "last7Days",
] as const satisfies readonly (keyof InboxTableStats)[];

/**
 * Inbox pipeline cards via `get_admin_list_stats` (one round-trip).
 */
export async function fetchInboxTableStats(
  supabase: ServerClient,
  table: InboxStatsTable,
): Promise<InboxTableStats> {
  return fetchAdminListStats(supabase, table, INBOX_STAT_KEYS);
}
