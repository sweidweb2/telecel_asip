import { describe, expect, it } from "vitest";

import { adminListFiltersActive } from "@/lib/admin/list-filters-active";

describe("adminListFiltersActive", () => {
  it("is false when every filter is empty or all", () => {
    expect(
      adminListFiltersActive({
        search: "",
        status: "all",
        role: undefined,
      }),
    ).toBe(false);
  });

  it("is true when search is set", () => {
    expect(adminListFiltersActive({ search: "ada", status: "all" })).toBe(
      true,
    );
  });

  it("is true when a discrete filter is not all", () => {
    expect(
      adminListFiltersActive({ search: undefined, status: "published" }),
    ).toBe(true);
  });

  it("ignores page size numbers", () => {
    expect(adminListFiltersActive({ pageSize: 25, search: "" })).toBe(false);
  });
});
