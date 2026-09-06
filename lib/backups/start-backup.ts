import "server-only";

import { runBackupJob } from "@/lib/backups/run-backup";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type BackupScope = Database["public"]["Enums"]["backup_scope"];
type BackupFormat = Database["public"]["Enums"]["backup_format"];

export type EnqueueBackupAttemptResult = {
  backupId: string;
  error?: string;
};

export type StartBackupAttemptResult = {
  backupId: string;
  ok: boolean;
  error?: string;
};

export type BackupAttemptInput = {
  userId?: string | null;
  scope: BackupScope;
  format: BackupFormat;
  targetTables?: readonly string[] | null;
  scheduleWindow?: string | null;
};

/**
 * Insert a pending backup row only (job runs separately).
 */
export async function enqueueBackupAttempt(
  input: BackupAttemptInput,
): Promise<EnqueueBackupAttemptResult> {
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
    // Partial unique index backups_one_in_flight_uidx — concurrent starts.
    if (error?.code === "23505") {
      return {
        backupId: "",
        error: "A backup is already running. Try again when it finishes.",
      };
    }
    return {
      backupId: "",
      error: error?.message ?? "Could not create backup record.",
    };
  }

  return { backupId: row.id };
}

/**
 * Insert + run synchronously (cron / scheduled window).
 */
export async function startBackupAttempt(
  input: BackupAttemptInput,
): Promise<StartBackupAttemptResult> {
  const enqueued = await enqueueBackupAttempt(input);
  if (!enqueued.backupId) {
    return {
      backupId: "",
      ok: false,
      error: enqueued.error ?? "Could not create backup record.",
    };
  }

  try {
    await runBackupJob({
      backupId: enqueued.backupId,
      scope: input.scope,
      format: input.format,
      targetTables: input.targetTables ?? null,
    });
    return { backupId: enqueued.backupId, ok: true };
  } catch (err) {
    return {
      backupId: enqueued.backupId,
      ok: false,
      error: err instanceof Error ? err.message : "Backup failed.",
    };
  }
}
