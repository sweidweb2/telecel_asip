import { describe, expect, it } from "vitest";

import {
  adminRowNumber,
  formatAdminDate,
  formatAdminDateTime,
} from "@/lib/admin-format";

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

describe("adminRowNumber", () => {
  it("uses absolute 1-based numbering across pages", () => {
    expect(adminRowNumber(1, 12, 0)).toBe(1);
    expect(adminRowNumber(1, 12, 11)).toBe(12);
    expect(adminRowNumber(2, 12, 0)).toBe(13);
  });
});
