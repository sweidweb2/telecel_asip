import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: vi.fn(() => ({ from })),
}));

import { getActiveStartupsPage } from "@/data/startups";

describe("getActiveStartupsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const range = vi.fn().mockResolvedValue({ data: [], count: 0, error: null });
    const orderId = vi.fn(() => ({ range }));
    const orderUpdated = vi.fn(() => ({ order: orderId }));
    const orderFeatured = vi.fn(() => ({ order: orderUpdated }));
    from.mockReturnValue({
      select: vi.fn(() => ({ order: orderFeatured })),
    });
  });

  it("reads from the active-only startups_public view", async () => {
    await getActiveStartupsPage(1, {
      cohort: "",
      country: "",
      sector: "",
      query: "",
    });
    expect(from).toHaveBeenCalledWith("startups_public");
  });
});
