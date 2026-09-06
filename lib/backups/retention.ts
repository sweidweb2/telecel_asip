import "server-only";

import { deleteBackupObject, getBackupRetentionCount } from "@/lib/backups/r2";
import { selectExpiredAutomatedBackups } from "@/lib/backups/serialize";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Delete automated backups beyond retention (R2 object first, then DB row).
 */
export async function applyAutomatedBackupRetention(): Promise<{
  deleted: number;
}> {
  const keep = getBackupRetentionCount();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("backups")
    .select("id, created_at, file_path, status")
    .eq("scope", "automated")
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Retention query failed: ${error.message}`);
  }

  const expired = selectExpiredAutomatedBackups(data ?? [], keep);
  let deleted = 0;

  for (const row of expired) {
    if (row.file_path) {
      try {
        await deleteBackupObject(row.file_path);
      } catch (err) {
        console.error("[backups] retention R2 delete failed", {
          id: row.id,
          file_path: row.file_path,
          err,
        });
      }
    }
    const { error: deleteError } = await admin
      .from("backups")
      .delete()
      .eq("id", row.id);
    if (deleteError) {
      console.error("[backups] retention DB delete failed", {
        id: row.id,
        message: deleteError.message,
      });
      continue;
    }
    deleted += 1;
  }

  return { deleted };
}
