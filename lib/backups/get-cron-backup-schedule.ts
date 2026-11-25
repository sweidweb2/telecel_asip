import {
  BACKUP_SCHEDULE_VALUES,
  type BackupScheduleValue,
} from "@/constants/backup-schedule";
import { SITE_SETTINGS_ID } from "@/constants/site-settings";
import { createAdminClient } from "@/lib/supabase/admin";

function isBackupSchedule(value: string): value is BackupScheduleValue {
  return (BACKUP_SCHEDULE_VALUES as readonly string[]).includes(value);
}

/**
 * Cron-only read of `site_settings.backup_time` via the service role.
 * Returns null when the row is missing or unreadable.
 */
export async function getCronBackupSchedule(): Promise<BackupScheduleValue | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("site_settings")
    .select("backup_time")
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  if (error || !data) {
    console.error("[backups] cron settings read failed", error);
    return null;
  }

  const backupTime = data.backup_time;
  if (!isBackupSchedule(backupTime)) return null;
  return backupTime;
}
