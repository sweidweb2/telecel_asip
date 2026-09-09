import "server-only";

import { deleteBackupObject } from "@/lib/backups/r2";
import {
  beirutCalendarMonthStartIso,
  isCreatedInBeirutMonth,
  pickMonthlyRetainIds,
  shiftBeirutMonth,
} from "@/lib/backups/retention-policy";
import { getBeirutParts, type BackupScheduleValue } from "@/lib/backups/schedule";
import { startBackupAttempt } from "@/lib/backups/start-backup";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_WINDOW_ATTEMPTS = 3;

/** Longer than route `maxDuration` (300s) so healthy jobs are not marked failed. */
export const BACKUP_STUCK_AFTER_MS = 20 * 60 * 1000;

const STUCK_ERROR_MESSAGE =
  "Timed out - job did not finish. Try again.";

/**
 * Mark abandoned pending/processing rows as failed so overlap does not block forever.
 */
export async function failStuckInFlightBackups(
  now: Date = new Date(),
): Promise<number> {
  const admin = createAdminClient();
  const cutoff = new Date(now.getTime() - BACKUP_STUCK_AFTER_MS).toISOString();
  const { data, error } = await admin
    .from("backups")
    .update({
      status: "failed",
      error_message: STUCK_ERROR_MESSAGE,
    })
    .in("status", ["pending", "processing"])
    .lt("created_at", cutoff)
    .select("id");

  if (error) {
    throw new Error(`Stuck backup cleanup failed: ${error.message}`);
  }

  const count = data?.length ?? 0;
  if (count > 0) {
    console.warn("[backups] marked stuck in-flight backups as failed", {
      count,
      cutoff,
    });
  }
  return count;
}

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
  return startBackupAttempt({
    userId: input.userId,
    scope: "automated",
    format: "json",
    targetTables: null,
    scheduleWindow: input.scheduleWindow,
  });
}

/**
 * Cron path: one attempt per tick. Up to MAX_WINDOW_ATTEMPTS failures across
 * hourly ticks for the same schedule_window, then wait for the next window.
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
  await failStuckInFlightBackups();
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

  const result = await startAutomatedBackupAttempt({
    scheduleWindow: input.scheduleWindow,
  });

  if (result.ok) {
    return { status: "success", attempts: 1, backupId: result.backupId };
  }

  const failedAfter = stats.failed + 1;
  return {
    status: "failed",
    attempts: 1,
    backupId: result.backupId || undefined,
    reason: failedAfter >= MAX_WINDOW_ATTEMPTS ? "exhausted" : "attempt_failed",
  };
}

export async function applyAutomatedBackupRetention(
  now: Date = new Date(),
): Promise<{ deleted: number }> {
  const admin = createAdminClient();
  const beirut = getBeirutParts(now);
  const m1 = shiftBeirutMonth(beirut.year, beirut.month, -1);
  const m2 = shiftBeirutMonth(beirut.year, beirut.month, -2);
  // Only load M-2 and older — M and M-1 are kept in full.
  const olderThanM1Iso = beirutCalendarMonthStartIso(m1.year, m1.month);

  const { data, error } = await admin
    .from("backups")
    .select("id, created_at, file_path, status")
    .eq("scope", "automated")
    .eq("status", "completed")
    .lt("created_at", olderThanM1Iso)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Retention query failed: ${error.message}`);
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return { deleted: 0 };
  }

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
