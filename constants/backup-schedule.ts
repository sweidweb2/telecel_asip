/** Backup schedule enum values and UI options (Lebanon / Asia/Beirut). */

export const BACKUP_SCHEDULE_VALUES = [
  "off",
  "daily_00",
  "daily_03",
  "daily_06",
  "daily_12",
  "daily_18",
  "weekly_sun_03",
  "weekly_mon_03",
] as const;

export type BackupScheduleValue = (typeof BACKUP_SCHEDULE_VALUES)[number];

/** Values offered in Settings (daily slots remain in DB for legacy rows). */
export const BACKUP_SCHEDULE_UI_VALUES = [
  "off",
  "weekly_sun_03",
  "weekly_mon_03",
] as const;

export type BackupScheduleUiValue = (typeof BACKUP_SCHEDULE_UI_VALUES)[number];

const ALL_LABELS: Record<BackupScheduleValue, string> = {
  off: "Off",
  daily_00: "Daily · 00:00 (Lebanon)",
  daily_03: "Daily · 03:00 (Lebanon)",
  daily_06: "Daily · 06:00 (Lebanon)",
  daily_12: "Daily · 12:00 (Lebanon)",
  daily_18: "Daily · 18:00 (Lebanon)",
  weekly_sun_03: "Weekly · Sunday 03:00 (Lebanon)",
  weekly_mon_03: "Weekly · Monday 03:00 (Lebanon)",
};

export const BACKUP_SCHEDULE_UI_OPTIONS: {
  value: BackupScheduleUiValue;
  label: string;
}[] = BACKUP_SCHEDULE_UI_VALUES.map((value) => ({
  value,
  label: ALL_LABELS[value],
}));

/** Full label map for cron/history/legacy display. */
export function backupScheduleLabel(value: BackupScheduleValue): string {
  return ALL_LABELS[value] ?? value;
}

/**
 * Options for the Settings select: UI values plus a one-off legacy item when
 * the stored schedule is a daily_* value not in the UI list.
 */
export function backupScheduleSelectOptions(
  current: BackupScheduleValue,
): { value: BackupScheduleValue; label: string }[] {
  const base: { value: BackupScheduleValue; label: string }[] =
    BACKUP_SCHEDULE_UI_OPTIONS.map((o) => ({ ...o }));
  if (
    !(BACKUP_SCHEDULE_UI_VALUES as readonly string[]).includes(current)
  ) {
    base.push({
      value: current,
      label: `${ALL_LABELS[current]} (legacy - pick weekly or Off)`,
    });
  }
  return base;
}

export function isBackupScheduleUiValue(
  value: string,
): value is BackupScheduleUiValue {
  return (BACKUP_SCHEDULE_UI_VALUES as readonly string[]).includes(value);
}
