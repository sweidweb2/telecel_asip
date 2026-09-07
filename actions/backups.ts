"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";

import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import {
  applyAutomatedBackupRetention,
  failStuckInFlightBackups,
  hasInFlightBackup,
} from "@/lib/backups/automated";
import { getSignedBackupUrl } from "@/lib/backups/r2";
import { runBackupJob } from "@/lib/backups/run-backup";
import {
  immediateScheduleWindow,
  isScheduleDue,
  scheduleWindowKey,
} from "@/lib/backups/schedule";
import { enqueueBackupAttempt } from "@/lib/backups/start-backup";
import type { BackupScheduleValue } from "@/constants/backup-schedule";
import type { AdminActionResult } from "@/types/admin-action";
import type { Database } from "@/types/database";
import { ROUTES } from "@/constants/routes";
import { SITE_SETTINGS_ID } from "@/data/settings";
import {
  createBackupSchema,
  getBackupDownloadUrlSchema,
  type CreateBackupInput,
} from "@/validations/backup";
import { z } from "zod";

const MESSAGES = {
  signedInRequired: "Sign in to manage backups.",
  unauthorized: "Only admins can manage backups.",
  invalidDetails: "Check the backup options and try again.",
  createStarted: "Backup started. Watch history — download when it completes.",
  downloadReady: "Download ready.",
  notFound: "Backup not found.",
  notReady: "This backup is not ready to download.",
  inFlight: "A backup is already running. Try again when it finishes.",
  runNowStarted: "Backup started. Watch history — download when it completes.",
  genericError: "Could not complete the backup.",
} as const;

export type CreateBackupResult = AdminActionResult;
export type BackupDownloadUrlResult =
  | { status: "success"; url: string; message: string }
  | { status: "error"; message: string };
export type RunBackupNowResult =
  | { status: "success"; message: string; id?: string }
  | { status: "error"; message: string };

export type BackupStatusResult =
  | {
      status: "success";
      backupStatus: Database["public"]["Enums"]["backup_status"];
      errorMessage: string | null;
    }
  | { status: "error"; message: string };

function scheduleBackupJob(input: {
  backupId: string;
  scope: Database["public"]["Enums"]["backup_scope"];
  format: Database["public"]["Enums"]["backup_format"];
  targetTables?: readonly string[] | null;
  applyRetention?: boolean;
}): void {
  after(async () => {
    try {
      await runBackupJob({
        backupId: input.backupId,
        scope: input.scope,
        format: input.format,
        targetTables: input.targetTables ?? null,
      });
      if (input.applyRetention) {
        try {
          await applyAutomatedBackupRetention();
        } catch (err) {
          console.error("[backups] retention after async job failed", err);
        }
      }
    } catch (err) {
      console.error("[backups] background job failed", {
        backupId: input.backupId,
        err,
      });
    } finally {
      revalidatePath(ROUTES.backup);
      if (input.applyRetention) {
        revalidatePath(ROUTES.settings);
      }
    }
  });
}

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

  await failStuckInFlightBackups();
  if (await hasInFlightBackup()) {
    return { status: "error", message: MESSAGES.inFlight };
  }

  const data = parsed.data;
  const format =
    data.scope === "storage" ? ("zip" as const) : data.format;

  const enqueued = await enqueueBackupAttempt({
    userId: session.userId,
    scope: data.scope,
    format,
    targetTables: null,
  });

  if (!enqueued.backupId) {
    return {
      status: "error",
      message: enqueued.error ?? MESSAGES.genericError,
    };
  }

  scheduleBackupJob({
    backupId: enqueued.backupId,
    scope: data.scope,
    format,
    targetTables: null,
  });

  revalidatePath(ROUTES.backup);

  return {
    status: "success",
    message: MESSAGES.createStarted,
    id: enqueued.backupId,
  };
}

/**
 * One-shot automated backup. Does not change stored backup_time.
 * Enqueues immediately; export continues in the background.
 */
export async function runBackupNow(): Promise<RunBackupNowResult> {
  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  await failStuckInFlightBackups();
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

  const enqueued = await enqueueBackupAttempt({
    userId: session.userId,
    scope: "automated",
    format: "json",
    targetTables: null,
    scheduleWindow: windowKey,
  });

  if (!enqueued.backupId) {
    return {
      status: "error",
      message: enqueued.error ?? MESSAGES.genericError,
    };
  }

  scheduleBackupJob({
    backupId: enqueued.backupId,
    scope: "automated",
    format: "json",
    targetTables: null,
    applyRetention: true,
  });

  revalidatePath(ROUTES.backup);
  revalidatePath(ROUTES.settings);

  return {
    status: "success",
    message: MESSAGES.runNowStarted,
    id: enqueued.backupId,
  };
}

const getBackupStatusSchema = z.object({
  backupId: z.uuid("Invalid backup id."),
});

/** Poll job status while a background export runs. */
export async function getBackupStatus(
  backupId: string,
): Promise<BackupStatusResult> {
  const parsed = getBackupStatusSchema.safeParse({ backupId });
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  await failStuckInFlightBackups();

  const { data: row, error } = await session.supabase
    .from("backups")
    .select("id, status, error_message")
    .eq("id", parsed.data.backupId)
    .maybeSingle();

  if (error) {
    return { status: "error", message: MESSAGES.genericError };
  }
  if (!row) {
    return { status: "error", message: MESSAGES.notFound };
  }

  return {
    status: "success",
    backupStatus: row.status,
    errorMessage: row.error_message,
  };
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
