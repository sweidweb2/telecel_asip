import { describe, expect, it } from "vitest";

import { formatAdminDate, formatAdminDateTime } from "@/lib/admin-format";

describe("formatAdminDate", () => {
  it("formats dates as MMM d, yyyy", () => {
    expect(formatAdminDate(new Date(2026, 8, 5))).toBe("Sep 5, 2026");
  });
});

describe("formatAdminDateTime", () => {
  it("formats timestamps with a middle dot before time", () => {
    expect(formatAdminDateTime(new Date(2026, 8, 5, 14, 30))).toBe(
      "Sep 5, 2026 · 14:30",
    );
  });
});
