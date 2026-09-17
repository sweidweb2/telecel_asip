import { beforeEach, describe, expect, it, vi } from "vitest";

const { eq, limit } = vi.hoisted(() => {
  const limit = vi.fn();
  const order = vi.fn(() => ({ limit }));
  const eq = vi.fn(() => ({ order }));
  return { eq, order, limit };
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

import { getVerifiedImpactMetrics } from "@/data/impact-metrics";

describe("getVerifiedImpactMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    limit.mockResolvedValue({ data: [], error: null });
  });

  it("filters to verified publish_status only", async () => {
    await getVerifiedImpactMetrics();
    expect(eq).toHaveBeenCalledWith("publish_status", "verified");
  });
});
