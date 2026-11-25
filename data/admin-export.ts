import type { ExportTable } from "@/lib/admin/export-tables";
import { EXPORT_TABLES } from "@/lib/admin/export-tables";
import { createClient } from "@/lib/supabase/server";

/**
 * One page of staff CSV export rows (RLS applies via the session client).
 * Editors may export profiles with admin rows hidden.
 */
export async function fetchAdminExportPage(options: {
  table: ExportTable;
  from: number;
  to: number;
  hideAdminProfiles: boolean;
}): Promise<Record<string, unknown>[]> {
  const { table, from, to, hideAdminProfiles } = options;
  const config = EXPORT_TABLES[table];
  const supabase = await createClient();

  if (table === "profiles") {
    let query = supabase
      .from("profiles")
      .select(config.columns)
      .order("created_at", { ascending: false })
      .range(from, to);
    if (hideAdminProfiles) {
      query = query.neq("role", "admin");
    }
    const result = await query;
    if (result.error) throw result.error;
    return (result.data ?? []) as unknown as Record<string, unknown>[];
  }

  const result = await supabase
    .from(table)
    .select(config.columns as never)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (result.error) throw result.error;
  return (result.data ?? []) as unknown as Record<string, unknown>[];
}
