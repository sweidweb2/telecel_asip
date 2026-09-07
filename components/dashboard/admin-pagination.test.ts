import { describe, expect, it } from "vitest";

import { adminPaginationHref } from "@/components/dashboard/admin-pagination";

describe("adminPaginationHref", () => {
  it("returns the base path on page 1 with no filters", () => {
    expect(adminPaginationHref("/dashboard/users", 1)).toBe("/dashboard/users");
  });

  it("adds page and keeps active filters", () => {
    expect(
      adminPaginationHref("/dashboard/performance", 3, {
        search: "upload",
        eventType: undefined,
        pageSize: "50",
      }),
    ).toBe("/dashboard/performance?page=3&search=upload&pageSize=50");
  });
});
