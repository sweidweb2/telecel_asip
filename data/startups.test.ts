import { beforeEach, describe, expect, it, vi } from "vitest";

const from = vi.hoisted(() => vi.fn());
const rpc = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: vi.fn(() => ({ from, rpc })),
}));

import {
  getActiveStartupCountryReach,
  getActiveStartupsPage,
} from "@/data/startups";

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

describe("getActiveStartupCountryReach", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the country-reach RPC and maps the payload", async () => {
    rpc.mockResolvedValue({
      data: [
        { country_code: "GH", founder_count: 3 },
        { country_code: "NG", founder_count: 1 },
      ],
      error: null,
    });

    await expect(getActiveStartupCountryReach()).resolves.toEqual([
      { countryCode: "GH", founderCount: 3 },
      { countryCode: "NG", founderCount: 1 },
    ]);
    expect(rpc).toHaveBeenCalledWith("get_active_startup_country_reach");
    expect(from).not.toHaveBeenCalled();
  });
});
