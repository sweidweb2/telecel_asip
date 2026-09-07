import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { BackupTableName } from "@/constants/backup-tables";
import type { Database } from "@/types/database";

type AdminClient = SupabaseClient<Database>;

const PAGE_SIZE = 1000;

/**
 * Paginated full-table read for backup dumps. Uses select('*') intentionally —
 * backup fidelity requires every column.
 */
export async function fetchAllTableRows(
  supabase: AdminClient,
  table: BackupTableName,
): Promise<Record<string, unknown>[]> {
  const rows: Record<string, unknown>[] = [];
  let from = 0;

  for (;;) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .range(from, to);

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
