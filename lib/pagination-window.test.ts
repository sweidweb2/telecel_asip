import { describe, expect, it } from "vitest";

import { getPaginationItems } from "@/lib/pagination-window";
import { formatFoundedDate, startupInitials } from "@/lib/startup-display";

describe("getPaginationItems", () => {
  it("returns empty for zero pages", () => {
    expect(getPaginationItems(1, 0)).toEqual([]);
  });

  it("returns a single page", () => {
    expect(getPaginationItems(1, 1)).toEqual([1]);
  });

  it("lists all pages when total is small", () => {
    expect(getPaginationItems(2, 3)).toEqual([1, 2, 3]);
  });

  it("inserts ellipsis for large totals", () => {
    expect(getPaginationItems(5, 20)).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      20,
    ]);
  });

  it("handles near-start and near-end windows", () => {
    expect(getPaginationItems(1, 10)).toEqual([1, 2, "ellipsis", 10]);
    expect(getPaginationItems(10, 10)).toEqual([1, "ellipsis", 9, 10]);
  });
});

describe("startupInitials", () => {
  it("uses first letters of two words", () => {
    expect(startupInitials("PayFlow Africa")).toBe("PA");
  });

  it("uses two letters from a single word", () => {
    expect(startupInitials("SolGrid")).toBe("SO");
  });
});

describe("formatFoundedDate", () => {
  it("formats YYYY-MM-DD without UTC day shift", () => {
    expect(formatFoundedDate("2024-01-01")).toBe("Jan 1, 2024");
  });

  it("formats with French locale when requested", () => {
    expect(formatFoundedDate("2024-01-01", "fr")).toMatch(/2024/);
  });
});
