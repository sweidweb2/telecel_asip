import "server-only";

import { deleteBackupObject } from "@/lib/backups/r2";
import { runBackupJob } from "@/lib/backups/run-backup";
import {
  getBeirutParts,
  isCreatedInBeirutMonth,
  pickMonthlyRetainIds,
  shiftBeirutMonth,
  type BackupScheduleValue,
} from "@/lib/backups/schedule";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_WINDOW_ATTEMPTS = 3;

export async function hasInFlightBackup(): Promise<boolean> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("backups")
    .select("id")
    .in("status", ["pending", "processing"])
    .limit(1);
  if (error) {
    throw new Error(`Overlap check failed: ${error.message}`);
  }
  return (data?.length ?? 0) > 0;
}

export async function getScheduleWindowStats(scheduleWindow: string): Promise<{
  completed: number;
  failed: number;
}> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("backups")
    .select("status")
    .eq("scope", "automated")
    .eq("schedule_window", scheduleWindow);
  if (error) {
    throw new Error(`Window stats failed: ${error.message}`);
  }
  let completed = 0;
  let failed = 0;
  for (const row of data ?? []) {
    if (row.status === "completed") completed += 1;
    if (row.status === "failed") failed += 1;
  }
  return { completed, failed };
}

/**
 * Insert + run one automated full JSON backup for a schedule window.
 */
export async function startAutomatedBackupAttempt(input: {
  scheduleWindow: string;
  userId?: string | null;
}): Promise<{ backupId: string; ok: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from("backups")
    .insert({
      user_id: input.userId ?? null,
      scope: "automated",
      format: "json",
      target_tables: null,
      status: "pending",
      schedule_window: input.scheduleWindow,
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
      scope: "automated",
      format: "json",
      targetTables: null,
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

/**
 * Cron path: up to 3 attempts for the window; stop on first success.
 */
export async function runScheduledBackupWindow(input: {
  backupTime: BackupScheduleValue;
  scheduleWindow: string;
}): Promise<{
  status: "success" | "failed" | "skipped";
  attempts: number;
  reason?: string;
  backupId?: string;
}> {
  if (await hasInFlightBackup()) {
    return { status: "skipped", attempts: 0, reason: "in_flight" };
  }

  const stats = await getScheduleWindowStats(input.scheduleWindow);
  if (stats.completed > 0) {
    return { status: "skipped", attempts: 0, reason: "already_completed" };
  }
  if (stats.failed >= MAX_WINDOW_ATTEMPTS) {
    return { status: "skipped", attempts: 0, reason: "max_failures" };
  }

  const remaining = MAX_WINDOW_ATTEMPTS - stats.failed;
  let attempts = 0;
  let lastId: string | undefined;

  for (let i = 0; i < remaining; i += 1) {
    if (i > 0 && (await hasInFlightBackup())) {
      return {
        status: "skipped",
        attempts,
        reason: "in_flight",
        backupId: lastId,
      };
    }
    attempts += 1;
    const result = await startAutomatedBackupAttempt({
      scheduleWindow: input.scheduleWindow,
    });
    lastId = result.backupId || lastId;
    if (result.ok) {
      return { status: "success", attempts, backupId: result.backupId };
    }
  }

  return { status: "failed", attempts, backupId: lastId, reason: "exhausted" };
}

export async function applyAutomatedBackupRetention(
  now: Date = new Date(),
): Promise<{ deleted: number }> {
  const admin = createAdminClient();
  const beirut = getBeirutParts(now);
  const m2 = shiftBeirutMonth(beirut.year, beirut.month, -2);

  const { data, error } = await admin
    .from("backups")
    .select("id, created_at, file_path, status")
    .eq("scope", "automated")
    .eq("status", "completed")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Retention query failed: ${error.message}`);
  }

  const rows = data ?? [];
  const toDeleteIds = new Set<string>();

  const m2Rows: { id: string; created_at: string }[] = [];

  for (const row of rows) {
    const parts = getBeirutParts(new Date(row.created_at));
    const index = parts.year * 12 + (parts.month - 1);
    const cutoff = m2.year * 12 + (m2.month - 1);
    if (index < cutoff) {
      toDeleteIds.add(row.id);
      continue;
    }
    if (isCreatedInBeirutMonth(row.created_at, m2.year, m2.month)) {
      m2Rows.push({ id: row.id, created_at: row.created_at });
    }
  }

  const keepM2 = new Set(pickMonthlyRetainIds(m2Rows, m2.year, m2.month));
  for (const row of m2Rows) {
    if (!keepM2.has(row.id)) toDeleteIds.add(row.id);
  }

  let deleted = 0;
  for (const row of rows) {
    if (!toDeleteIds.has(row.id)) continue;
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
