/** Pure monthly retention helpers for automated backups (Beirut calendar). */

import { getBeirutParts } from "@/lib/backups/schedule";

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
