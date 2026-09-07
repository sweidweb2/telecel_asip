import { describe, expect, it } from "vitest";

import {
  beirutCalendarMonthStartIso,
  pickMonthlyRetainIds,
  shiftBeirutMonth,
} from "@/lib/backups/retention-policy";
import {
  getBeirutParts,
  isScheduleDue,
  scheduleWindowKey,
} from "@/lib/backups/schedule";

describe("getBeirutParts", () => {
  it("returns stable parts for a fixed UTC instant", () => {
    // 2026-09-06 00:30 UTC → 03:30 Beirut (UTC+3 in September)
    const parts = getBeirutParts(new Date("2026-09-06T00:30:00.000Z"));
    expect(parts.year).toBe(2026);
    expect(parts.month).toBe(9);
    expect(parts.day).toBe(6);
    expect(parts.hour).toBe(3);
    expect(parts.weekday).toBe(0); // Sunday
  });
});

describe("isScheduleDue / scheduleWindowKey", () => {
  const sunday0300Beirut = new Date("2026-09-06T00:30:00.000Z");

  it("matches daily_03 at Beirut hour 3", () => {
    expect(isScheduleDue("daily_03", sunday0300Beirut)).toBe(true);
    expect(isScheduleDue("daily_12", sunday0300Beirut)).toBe(false);
    expect(isScheduleDue("off", sunday0300Beirut)).toBe(false);
  });

  it("matches weekly_sun_03 on Sunday at 03:00 Beirut", () => {
    expect(isScheduleDue("weekly_sun_03", sunday0300Beirut)).toBe(true);
    expect(isScheduleDue("weekly_mon_03", sunday0300Beirut)).toBe(false);
  });

  it("builds daily and weekly window keys", () => {
    expect(scheduleWindowKey("daily_03", sunday0300Beirut)).toBe(
      "daily:2026-09-06:03",
    );
    expect(scheduleWindowKey("weekly_sun_03", sunday0300Beirut)).toBe(
      "weekly:2026-09-06:sun03",
    );
    expect(scheduleWindowKey("off", sunday0300Beirut)).toBeNull();
  });
});

describe("shiftBeirutMonth", () => {
  it("shifts back two months across year boundary", () => {
    expect(shiftBeirutMonth(2026, 1, -2)).toEqual({ year: 2025, month: 11 });
    expect(shiftBeirutMonth(2026, 9, -2)).toEqual({ year: 2026, month: 7 });
  });
});

describe("beirutCalendarMonthStartIso", () => {
  it("formats UTC midnight on day 1", () => {
    expect(beirutCalendarMonthStartIso(2026, 8)).toBe("2026-08-01T00:00:00.000Z");
    expect(beirutCalendarMonthStartIso(2025, 11)).toBe(
      "2025-11-01T00:00:00.000Z",
    );
  });

  it("excludes M and M-1 when filtering older than M-1 start", () => {
    // "now" ≈ Sep 2026 Beirut → M-1 = Aug 2026
    const m1 = shiftBeirutMonth(2026, 9, -1);
    const bound = beirutCalendarMonthStartIso(m1.year, m1.month);
    const candidates = [
      { id: "m", created_at: "2026-09-06T00:30:00.000Z" },
      { id: "m1", created_at: "2026-08-15T10:00:00.000Z" },
      { id: "m2", created_at: "2026-07-20T10:00:00.000Z" },
      { id: "older", created_at: "2026-06-01T10:00:00.000Z" },
    ].filter((row) => row.created_at < bound);
    expect(candidates.map((r) => r.id)).toEqual(["m2", "older"]);
  });
});

describe("pickMonthlyRetainIds", () => {
  it("keeps all when ≤3", () => {
    const rows = [
      { id: "a", created_at: "2026-07-01T10:00:00.000Z" },
      { id: "b", created_at: "2026-07-15T10:00:00.000Z" },
    ];
    expect(pickMonthlyRetainIds(rows, 2026, 7).sort()).toEqual(["a", "b"]);
  });

  it("keeps nearest start / mid / end when more than 3", () => {
    const rows = [
      { id: "early", created_at: "2026-07-01T08:00:00.000Z" },
      { id: "early2", created_at: "2026-07-02T08:00:00.000Z" },
      { id: "mid", created_at: "2026-07-16T08:00:00.000Z" },
      { id: "mid2", created_at: "2026-07-17T08:00:00.000Z" },
      { id: "late", created_at: "2026-07-30T08:00:00.000Z" },
      { id: "late2", created_at: "2026-07-31T08:00:00.000Z" },
    ];
    const keep = new Set(pickMonthlyRetainIds(rows, 2026, 7));
    expect(keep.size).toBe(3);
    expect(keep.has("early")).toBe(true);
    expect(keep.has("mid")).toBe(true);
    expect(keep.has("late2")).toBe(true);
  });
});
