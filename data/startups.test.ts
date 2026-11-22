import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.hoisted(() => vi.fn());
const rpc = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: vi.fn(() => ({ from, rpc })),
}));

import { getActiveStartupsPage } from "@/data/startups";

describe("getActiveStartupsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const orderId = vi.fn().mockResolvedValue({ data: [], error: null });
    from.mockReturnValue({
      select: vi.fn(() => ({ order: orderId })),
    });
  });

  it("reads from the active-only startups_public view", async () => {
    await getActiveStartupsPage(
      1,
      {
        cohort: "",
        country: "",
        sector: "",
        query: "",
      },
      42,
    );
    expect(from).toHaveBeenCalledWith("startups_public");
  });
});
