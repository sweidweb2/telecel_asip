"use server";

import { revalidatePath } from "next/cache";

import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { getSignedBackupUrl } from "@/lib/backups/r2";
import { runBackupJob } from "@/lib/backups/run-backup";
import type { AdminActionResult } from "@/types/admin-action";
import { ROUTES } from "@/constants/routes";
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
  genericError: "Could not complete the backup.",
} as const;

export type CreateBackupResult = AdminActionResult;
export type BackupDownloadUrlResult =
  | { status: "success"; url: string; message: string }
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

  const data = parsed.data;
  const format =
    data.scope === "storage" ? ("zip" as const) : data.format;
  const targetTables =
    data.scope === "tables" ? (data.targetTables ?? null) : null;

  const { data: row, error } = await session.supabase
    .from("backups")
    .insert({
      user_id: session.userId,
      scope: data.scope,
      format,
      target_tables: targetTables,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !row?.id) {
    return {
      status: "error",
      message: error?.message ?? MESSAGES.genericError,
    };
  }

  try {
    await runBackupJob({
      backupId: row.id,
      scope: data.scope,
      format,
      targetTables,
    });
  } catch (err) {
    revalidatePath(ROUTES.backup);
    return {
      status: "error",
      message:
        err instanceof Error ? err.message : MESSAGES.genericError,
    };
  }

  revalidatePath(ROUTES.backup);
  return { status: "success", message: MESSAGES.createSuccess, id: row.id };
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
