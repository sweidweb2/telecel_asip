import { describe, expect, it } from "vitest";

import {
  adminListRange,
  adminListTotalPages,
} from "@/lib/admin/admin-list-query";

describe("adminListRange", () => {
  it("returns inclusive bounds for page 1", () => {
    expect(adminListRange(1, 20)).toEqual({ from: 0, to: 19 });
  });

  it("offsets by page size", () => {
    expect(adminListRange(3, 10)).toEqual({ from: 20, to: 29 });
  });
});

describe("adminListTotalPages", () => {
  it("returns at least 1 for empty results", () => {
    expect(adminListTotalPages(0, 20)).toBe(1);
  });

  it("ceils fractional pages", () => {
    expect(adminListTotalPages(21, 20)).toBe(2);
  });
});
