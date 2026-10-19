import { describe, expect, it } from "vitest";

import { parseAdminCatalogResource } from "@/constants/admin-public-reflections";

describe("parseAdminCatalogResource", () => {
  it("reads a known resource id", () => {
    expect(parseAdminCatalogResource("events")).toBe("events");
    expect(parseAdminCatalogResource(["impactMetrics"])).toBe("impactMetrics");
  });

  it("falls back to the first guide for a missing or unknown value", () => {
    expect(parseAdminCatalogResource(undefined)).toBe("portfolio");
    expect(parseAdminCatalogResource("users")).toBe("portfolio");
    expect(parseAdminCatalogResource(["", "blogs"])).toBe("portfolio");
  });
});
