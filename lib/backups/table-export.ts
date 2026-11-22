import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { BackupTableName } from "@/constants/backup-tables";
import type { Database } from "@/types/database";

type AdminClient = SupabaseClient<Database>;

const PAGE_SIZE = 1000;

/**
 * Stable ORDER BY for paginated dumps. Unordered `.range()` can skip/duplicate
 * rows when the table changes mid-export.
 */
const BACKUP_ORDER_COLUMNS: Record<BackupTableName, readonly string[]> = {
  profiles: ["id"],
  interest_registrations: ["id"],
  applications: ["id"],
  investor_interests: ["id"],
  investor_engagements: ["id"],
  contact_messages: ["id"],
  site_settings: ["id"],
  newsletter_subscribers: ["id"],
  blogs: ["id"],
  startups: ["id"],
  startup_details: ["startup_id"],
  partners: ["id"],
  evidence_records: ["id"],
  impact_metrics: ["id"],
  founder_stories: ["id"],
  events: ["id"],
  event_startups: ["event_id", "startup_id"],
  cohorts: ["id"],
  cohort_partners: ["cohort_id", "partner_id"],
  cohort_startups: ["cohort_id", "startup_id"],
  admin_perf_events: ["id"],
};

/**
 * Paginated full-table read for backup dumps. Uses select('*') intentionally —
 * backup fidelity requires every column. Rows are ordered by primary key so
 * offset pagination stays stable under concurrent writes.
 */
export async function fetchAllTableRows(
  supabase: AdminClient,
  table: BackupTableName,
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let from = 0;
  const orderColumns = BACKUP_ORDER_COLUMNS[table];

  for (;;) {
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from(table).select("*");
    for (const column of orderColumns) {
      query = query.order(column, { ascending: true });
    }
    const { data, error } = await query.range(from, to);

    if (error) {
      throw new Error(`Failed to read table ${table}: ${error.message}`);
    }

    const batch = (data ?? []) as Record<string, unknown>[];
    rows.push(...batch);

    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return rows;
}
