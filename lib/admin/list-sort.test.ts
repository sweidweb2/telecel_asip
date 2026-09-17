import { describe, expect, it } from "vitest";

import {
  adminOrderAscending,
  parseListSortDir,
} from "@/lib/admin/list-sort";

describe("list-sort", () => {
  it("parses asc and desc only", () => {
    expect(parseListSortDir("asc")).toBe("asc");
    expect(parseListSortDir("desc")).toBe("desc");
    expect(parseListSortDir("sideways")).toBeUndefined();
    expect(parseListSortDir(undefined)).toBeUndefined();
  });

  it("maps dir to ascending flag", () => {
    expect(adminOrderAscending("asc")).toBe(true);
    expect(adminOrderAscending("desc")).toBe(false);
  });
});
