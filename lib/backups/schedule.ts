/** Asia/Beirut schedule helpers for automated backups (pure / testable). */

export const BACKUP_TIMEZONE = "Asia/Beirut";

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

export const BACKUP_SCHEDULE_OPTIONS: {
  value: BackupScheduleValue;
  label: string;
}[] = [
  { value: "off", label: "Off" },
  { value: "daily_00", label: "Daily · 00:00 (Lebanon)" },
  { value: "daily_03", label: "Daily · 03:00 (Lebanon)" },
  { value: "daily_06", label: "Daily · 06:00 (Lebanon)" },
  { value: "daily_12", label: "Daily · 12:00 (Lebanon)" },
  { value: "daily_18", label: "Daily · 18:00 (Lebanon)" },
  { value: "weekly_sun_03", label: "Weekly · Sunday 03:00 (Lebanon)" },
  { value: "weekly_mon_03", label: "Weekly · Monday 03:00 (Lebanon)" },
];

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
    // ISO week-ish label from the Beirut date of the due day
    return `weekly:${beirut.isoDate}:${weekly.weekday === 0 ? "sun" : "mon"}${String(weekly.hour).padStart(2, "0")}`;
  }
  return null;
}

export function immediateScheduleWindow(now: Date = new Date()): string {
  return `immediate:${now.toISOString()}`;
}

export function runNowScheduleWindow(
  backupTime: BackupScheduleValue,
  now: Date = new Date(),
): string {
  const scheduled = scheduleWindowKey(backupTime, now);
  if (scheduled) return `runnow:${scheduled}`;
  return `runnow:${immediateScheduleWindow(now)}`;
}

/** Beirut year/month shifted by deltaMonths (can be negative). */
export function shiftBeirutMonth(
  year: number,
  month: number,
  deltaMonths: number,
): { year: number; month: number } {
  const index = year * 12 + (month - 1) + deltaMonths;
  return {
    year: Math.floor(index / 12),
    month: (index % 12) + 1,
  };
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * Keep ≤3 backups for a calendar month: nearest to start, mid, end.
 * If ≤3 rows, keep all. Targets are day 1 00:00, mid-month, last day 23:59 (UTC ms proxy via created_at).
 */
export function pickMonthlyRetainIds(
  rows: { id: string; created_at: string }[],
  year: number,
  month: number,
): string[] {
  if (rows.length <= 3) {
    return rows.map((r) => r.id);
  }

  const lastDay = daysInMonth(year, month);
  const midDay = Math.ceil(lastDay / 2);
  const startMs = Date.UTC(year, month - 1, 1, 0, 0, 0);
  const midMs = Date.UTC(year, month - 1, midDay, 12, 0, 0);
  const endMs = Date.UTC(year, month - 1, lastDay, 23, 59, 59);

  const withMs = rows.map((row) => ({
    id: row.id,
    ms: new Date(row.created_at).getTime(),
  }));

  function nearest(target: number, exclude: Set<string>): string {
    let best = withMs[0]!;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const row of withMs) {
      if (exclude.has(row.id)) continue;
      const dist = Math.abs(row.ms - target);
      if (dist < bestDist) {
        best = row;
        bestDist = dist;
      }
    }
    return best.id;
  }

  const keep = new Set<string>();
  keep.add(nearest(startMs, keep));
  keep.add(nearest(midMs, keep));
  keep.add(nearest(endMs, keep));
  return [...keep];
}

/** True if created_at falls in Beirut calendar year/month. */
export function isCreatedInBeirutMonth(
  createdAtIso: string,
  year: number,
  month: number,
): boolean {
  const parts = getBeirutParts(new Date(createdAtIso));
  return parts.year === year && parts.month === month;
}
