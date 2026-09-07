/** Asia/Beirut schedule helpers for automated backups (pure / testable). */

import {
  BACKUP_SCHEDULE_VALUES,
  type BackupScheduleValue,
} from "@/constants/backup-schedule";

export const BACKUP_TIMEZONE = "Asia/Beirut";

export {
  BACKUP_SCHEDULE_VALUES,
  type BackupScheduleValue,
} from "@/constants/backup-schedule";

export type BeirutParts = {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
  hour: number;
  /** 0 = Sunday … 6 = Saturday (JS convention) */
  weekday: number;
  isoDate: string;
};

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  const found = parts.find((p) => p.type === type)?.value;
  if (!found) throw new Error(`Missing Beirut date part: ${type}`);
  return found;
}

export function getBeirutParts(now: Date = new Date()): BeirutParts {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: BACKUP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });
  const parts = fmt.formatToParts(now);
  const year = Number(part(parts, "year"));
  const month = Number(part(parts, "month"));
  const day = Number(part(parts, "day"));
  const hour = Number(part(parts, "hour"));
  const weekdayShort = part(parts, "weekday").toLowerCase();
  const weekdayMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };
  const weekday = weekdayMap[weekdayShort.slice(0, 3)];
  if (weekday === undefined) {
    throw new Error(`Unknown Beirut weekday: ${weekdayShort}`);
  }
  const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, day, hour, weekday, isoDate };
}

function parseDailyHour(value: BackupScheduleValue): number | null {
  const match = /^daily_(\d{2})$/.exec(value);
  if (!match) return null;
  return Number(match[1]);
}

function parseWeekly(
  value: BackupScheduleValue,
): { weekday: number; hour: number } | null {
  if (value === "weekly_sun_03") return { weekday: 0, hour: 3 };
  if (value === "weekly_mon_03") return { weekday: 1, hour: 3 };
  return null;
}

/** True when the current Beirut hour matches the stored cadence. */
export function isScheduleDue(
  backupTime: BackupScheduleValue,
  now: Date = new Date(),
): boolean {
  if (backupTime === "off") return false;
  if (!(BACKUP_SCHEDULE_VALUES as readonly string[]).includes(backupTime)) {
    return false;
  }
  const beirut = getBeirutParts(now);
  const dailyHour = parseDailyHour(backupTime);
  if (dailyHour !== null) {
    return beirut.hour === dailyHour;
  }
  const weekly = parseWeekly(backupTime);
  if (weekly) {
    return beirut.weekday === weekly.weekday && beirut.hour === weekly.hour;
  }
  return false;
}

/**
 * Stable key for one scheduled attempt window (Beirut).
 * Used for idempotency and retry counting.
 */
export function scheduleWindowKey(
  backupTime: BackupScheduleValue,
  now: Date = new Date(),
): string | null {
  if (backupTime === "off") return null;
  const beirut = getBeirutParts(now);
  const dailyHour = parseDailyHour(backupTime);
  if (dailyHour !== null) {
    return `daily:${beirut.isoDate}:${String(dailyHour).padStart(2, "0")}`;
  }
  const weekly = parseWeekly(backupTime);
  if (weekly) {
    return `weekly:${beirut.isoDate}:${weekly.weekday === 0 ? "sun" : "mon"}${String(weekly.hour).padStart(2, "0")}`;
  }
  return null;
}

export function immediateScheduleWindow(now: Date = new Date()): string {
  return `immediate:${now.toISOString()}`;
}
