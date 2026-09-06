import "server-only";

import { runBackupJob } from "@/lib/backups/run-backup";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type BackupScope = Database["public"]["Enums"]["backup_scope"];
type BackupFormat = Database["public"]["Enums"]["backup_format"];

export type StartBackupAttemptResult = {
  backupId: string;
  ok: boolean;
  error?: string;
};

/**
 * Shared insert + run path for manual and automated backups.
 */
export async function startBackupAttempt(input: {
  userId?: string | null;
  scope: BackupScope;
  format: BackupFormat;
  targetTables?: readonly string[] | null;
  scheduleWindow?: string | null;
}): Promise<StartBackupAttemptResult> {
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("backups")
    .insert({
      user_id: input.userId ?? null,
      scope: input.scope,
      format: input.format,
      target_tables: input.targetTables ? [...input.targetTables] : null,
      status: "pending",
      schedule_window: input.scheduleWindow ?? null,
    })
    .select("id")
    .single();

  if (error || !row?.id) {
    return {
      backupId: "",
      ok: false,
      error: error?.message ?? "Could not create backup record.",
    };
  }

  try {
    await runBackupJob({
      backupId: row.id,
      scope: input.scope,
      format: input.format,
      targetTables: input.targetTables ?? null,
    });
    return { backupId: row.id, ok: true };
  } catch (err) {
    return {
      backupId: row.id,
      ok: false,
      error: err instanceof Error ? err.message : "Backup failed.",
    };
  }
}
