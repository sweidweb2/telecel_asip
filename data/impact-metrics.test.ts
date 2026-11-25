import { beforeEach, describe, expect, it, vi } from "vitest";

const { eq, contains, limit } = vi.hoisted(() => {
  const limit = vi.fn();
  const order = vi.fn(() => ({ limit }));
  const contains = vi.fn(() => ({ order }));
  const eq = vi.fn(() => ({ order, contains }));
  return { eq, contains, order, limit };
});

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq })),
    })),
  })),
}));

import {
  getHomeImpactMetrics,
  getVerifiedImpactMetrics,
} from "@/data/impact-metrics";

describe("getVerifiedImpactMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limit.mockResolvedValue({ data: [], error: null });
  });

  it("filters to verified publish_status only", async () => {
    await getVerifiedImpactMetrics();
    expect(eq).toHaveBeenCalledWith("publish_status", "verified");
    expect(contains).not.toHaveBeenCalled();
  });
});

describe("getHomeImpactMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limit.mockResolvedValue({ data: [], error: null });
  });

  it("filters verified metrics tagged homepage_module_02 in SQL", async () => {
    await getHomeImpactMetrics();
    expect(eq).toHaveBeenCalledWith("publish_status", "verified");
    expect(contains).toHaveBeenCalledWith("display_locations", [
      "homepage_module_02",
    ]);
  });
});
