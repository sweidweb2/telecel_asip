import { describe, expect, it } from "vitest";

import { cacheStatusFromInvokeCount } from "@/lib/admin/perf/cache-status";

describe("cacheStatusFromInvokeCount", () => {
  it("marks the first invoke as miss", () => {
    expect(cacheStatusFromInvokeCount(1)).toBe("miss");
  });

  it("marks later invokes as hit", () => {
    expect(cacheStatusFromInvokeCount(2)).toBe("hit");
    expect(cacheStatusFromInvokeCount(5)).toBe("hit");
  });
});
