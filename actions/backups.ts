"use server";

import { revalidatePath } from "next/cache";

import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import {
  applyAutomatedBackupRetention,
  hasInFlightBackup,
  startAutomatedBackupAttempt,
} from "@/lib/backups/automated";
import { getSignedBackupUrl } from "@/lib/backups/r2";
import {
  immediateScheduleWindow,
  isScheduleDue,
  scheduleWindowKey,
} from "@/lib/backups/schedule";
import { startBackupAttempt } from "@/lib/backups/start-backup";
import type { BackupScheduleValue } from "@/constants/backup-schedule";
import type { AdminActionResult } from "@/types/admin-action";
import { ROUTES } from "@/constants/routes";
import { SITE_SETTINGS_ID } from "@/data/settings";
import {
  createBackupSchema,
  getBackupDownloadUrlSchema,
  type CreateBackupInput,
} from "@/validations/backup";

const MESSAGES = {
  signedInRequired: "Sign in to manage backups.",
  unauthorized: "Only admins can manage backups.",
  invalidDetails: "Check the backup options and try again.",
  createSuccess: "Backup completed.",
  downloadReady: "Download ready.",
  notFound: "Backup not found.",
  notReady: "This backup is not ready to download.",
  inFlight: "A backup is already running. Try again when it finishes.",
  runNowSuccess: "Backup completed.",
  runNowStartedFailed: "Backup failed. Check Backup history for details.",
  genericError: "Could not complete the backup.",
} as const;

export type CreateBackupResult = AdminActionResult;
export type BackupDownloadUrlResult =
  | { status: "success"; url: string; message: string }
  | { status: "error"; message: string };
export type RunBackupNowResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export async function createBackup(
  input: CreateBackupInput,
): Promise<CreateBackupResult> {
  const parsed = createBackupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  if (await hasInFlightBackup()) {
    return { status: "error", message: MESSAGES.inFlight };
  }

  const data = parsed.data;
  const format =
    data.scope === "storage" ? ("zip" as const) : data.format;

  const result = await startBackupAttempt({
    userId: session.userId,
    scope: data.scope,
    format,
    targetTables: null,
  });

  revalidatePath(ROUTES.backup);

  if (!result.ok) {
    return {
      status: "error",
      message: result.error ?? MESSAGES.genericError,
    };
  }

  return {
    status: "success",
    message: MESSAGES.createSuccess,
    id: result.backupId,
  };
}

/**
 * One-shot automated backup. Does not change stored backup_time.
 * When the schedule is currently due, uses the same window key so the hourly
 * tick will skip that window after success.
 */
export async function runBackupNow(): Promise<RunBackupNowResult> {
  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  if (await hasInFlightBackup()) {
    return { status: "error", message: MESSAGES.inFlight };
  }

  const { data: settings, error } = await session.supabase
    .from("site_settings")
    .select("backup_time")
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  if (error || !settings) {
    return { status: "error", message: MESSAGES.genericError };
  }

  const backupTime = settings.backup_time as BackupScheduleValue;
  const now = new Date();
  const windowKey =
    backupTime !== "off" && isScheduleDue(backupTime, now)
      ? (scheduleWindowKey(backupTime, now) ?? immediateScheduleWindow(now))
      : immediateScheduleWindow(now);

  const result = await startAutomatedBackupAttempt({
    scheduleWindow: windowKey,
    userId: session.userId,
  });

  try {
    await applyAutomatedBackupRetention(now);
  } catch (err) {
    console.error("[backups] retention after runBackupNow failed", err);
  }

  revalidatePath(ROUTES.backup);
  revalidatePath(ROUTES.settings);

  if (!result.ok) {
    return { status: "error", message: MESSAGES.runNowStartedFailed };
  }

  return { status: "success", message: MESSAGES.runNowSuccess };
}

export async function getBackupDownloadUrl(
  backupId: string,
): Promise<BackupDownloadUrlResult> {
  const parsed = getBackupDownloadUrlSchema.safeParse({ backupId });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data: row, error } = await session.supabase
    .from("backups")
    .select("id, status, file_path")
    .eq("id", parsed.data.backupId)
    .maybeSingle();

  if (error) {
    return { status: "error", message: MESSAGES.genericError };
  }
  if (!row) {
    return { status: "error", message: MESSAGES.notFound };
  }
  if (row.status !== "completed" || !row.file_path) {
    return { status: "error", message: MESSAGES.notReady };
  }

  try {
    const url = await getSignedBackupUrl(row.file_path, 900);
    return { status: "success", url, message: MESSAGES.downloadReady };
  } catch (err) {
    console.error("[backups] signed URL failed", err);
    return {
      status: "error",
      message: "Could not create a download link.",
    };
  }
}
