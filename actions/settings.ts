"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { SITE_SETTINGS_CACHE_TAG, SITE_SETTINGS_ID } from "@/data/settings";
import {
  applyAutomatedBackupRetention,
  hasInFlightBackup,
  startAutomatedBackupAttempt,
} from "@/lib/backups/automated";
import {
  immediateScheduleWindow,
  isScheduleDue,
  runNowScheduleWindow,
  scheduleWindowKey,
  type BackupScheduleValue,
} from "@/lib/backups/schedule";
import { createClient } from "@/lib/supabase/server";
import {
  updateSiteSettingsSchema,
  type UpdateSiteSettingsInput,
} from "@/validations/settings";

export type SiteSettingsActionResult =
  | { status: "success"; message: string; backupStarted?: boolean }
  | { status: "error"; message: string };

const MESSAGES = {
  invalidDetails: "Please check the form and try again.",
  updateSuccess: "Settings saved.",
  updateSuccessWithBackup: "Settings saved. A backup started.",
  runNowSuccess: "Backup completed.",
  runNowStartedFailed: "Backup failed. Check Backup history for details.",
  inFlight: "A backup is already running. Try again when it finishes.",
  genericError: "Something went wrong. Please try again.",
  unauthorized: "You do not have permission to change site settings.",
  signedInRequired: "You must be signed in.",
} as const;

async function requireSettingsAdmin(): Promise<
  | { status: "error"; message: string }
  | {
      status: "ok";
      userId: string;
      supabase: Awaited<ReturnType<typeof createClient>>;
    }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "error", message: MESSAGES.signedInRequired };
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) {
    return { status: "error", message: MESSAGES.unauthorized };
  }

  return { status: "ok", userId: user.id, supabase };
}

function revalidateSettingsCaches() {
  revalidateTag(SITE_SETTINGS_CACHE_TAG, "max");
  revalidatePath("/en", "layout");
  revalidatePath("/fr", "layout");
  revalidatePath("/en");
  revalidatePath("/fr");
  revalidatePath("/en/programme");
  revalidatePath("/fr/programme");
  revalidatePath("/en/insights");
  revalidatePath("/fr/insights");
  revalidatePath("/en/apply");
  revalidatePath("/fr/apply");
  revalidatePath(ROUTES.settings);
  revalidatePath(ROUTES.backup);
}

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput,
): Promise<SiteSettingsActionResult> {
  const parsed = updateSiteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const auth = await requireSettingsAdmin();
  if (auth.status === "error") return auth;

  const { data: previous, error: previousError } = await auth.supabase
    .from("site_settings")
    .select("backup_time")
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  if (previousError || !previous) {
    return { status: "error", message: MESSAGES.genericError };
  }

  const previousBackupTime = previous.backup_time as BackupScheduleValue;
  const nextBackupTime = parsed.data.backupTime;
  const scheduleChanged = previousBackupTime !== nextBackupTime;

  const { data, error } = await auth.supabase
    .from("site_settings")
    .update({
      open_applications: parsed.data.openApplications,
      newsletter_signup_enabled: parsed.data.newsletterSignupEnabled,
      backup_time: nextBackupTime,
    })
    .eq("id", SITE_SETTINGS_ID)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { status: "error", message: MESSAGES.genericError };
  }

  revalidateSettingsCaches();

  if (!scheduleChanged) {
    return { status: "success", message: MESSAGES.updateSuccess };
  }

  if (await hasInFlightBackup()) {
    return {
      status: "success",
      message:
        "Settings saved. Schedule updated; skipped immediate backup because another backup is running.",
      backupStarted: false,
    };
  }

  const result = await startAutomatedBackupAttempt({
    scheduleWindow: immediateScheduleWindow(),
    userId: auth.userId,
  });

  try {
    await applyAutomatedBackupRetention();
  } catch (err) {
    console.error("[backups] retention after settings change failed", err);
  }

  if (!result.ok) {
    return {
      status: "success",
      message:
        "Settings saved, but the immediate backup failed. Check Backup history.",
      backupStarted: true,
    };
  }

  return {
    status: "success",
    message: MESSAGES.updateSuccessWithBackup,
    backupStarted: true,
  };
}

/**
 * One-shot backup from Settings. Does not change stored backup_time.
 * When the schedule is currently due, uses the same window key so the hourly
 * tick will skip that window after success.
 */
export async function runBackupNow(): Promise<SiteSettingsActionResult> {
  const auth = await requireSettingsAdmin();
  if (auth.status === "error") return auth;

  if (await hasInFlightBackup()) {
    return { status: "error", message: MESSAGES.inFlight };
  }

  const { data: settings, error } = await auth.supabase
    .from("site_settings")
    .select("backup_time")
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  if (error || !settings) {
    return { status: "error", message: MESSAGES.genericError };
  }

  const backupTime = settings.backup_time as BackupScheduleValue;
  const now = new Date();
  let windowKey: string;
  if (backupTime !== "off" && isScheduleDue(backupTime, now)) {
    windowKey = scheduleWindowKey(backupTime, now) ?? runNowScheduleWindow(backupTime, now);
  } else {
    windowKey = immediateScheduleWindow(now);
  }

  const result = await startAutomatedBackupAttempt({
    scheduleWindow: windowKey,
    userId: auth.userId,
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
