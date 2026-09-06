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
  | "contact_messages";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

function countOrThrow(result: {
  count: number | null;
  error: { message: string } | null;
}): number {
  if (result.error) throw result.error;
  return result.count ?? 0;
}

/**
 * Exact head counts for one inbox table (total / unread / reviewed / last 7 days).
 * Four parallel PostgREST count queries — CMS volume stays small.
 */
export async function fetchInboxTableStats(
  supabase: ServerClient,
  table: InboxStatsTable,
): Promise<InboxTableStats> {
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [total, unread, reviewed, last7Days] = await Promise.all([
    supabase.from(table).select("id", { count: "exact", head: true }),
    supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("inbox_status", "unread"),
    supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("inbox_status", "reviewed"),
    supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .gte("created_at", since7),
  ]);

  return {
    total: countOrThrow(total),
    unread: countOrThrow(unread),
    reviewed: countOrThrow(reviewed),
    last7Days: countOrThrow(last7Days),
  };
}
