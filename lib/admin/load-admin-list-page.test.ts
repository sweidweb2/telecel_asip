import { describe, expect, it } from "vitest";

import { adminListClampParams } from "@/lib/admin/load-admin-list-page";

describe("adminListClampParams", () => {
  it("always sets page and skips empty filters", () => {
    const params = adminListClampParams(4, {
      search: "ada",
      status: undefined,
      type: "",
    });
    expect(params.get("page")).toBe("4");
    expect(params.get("search")).toBe("ada");
    expect(params.has("status")).toBe(false);
    expect(params.has("type")).toBe(false);
  });
});
