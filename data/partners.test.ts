import { beforeEach, describe, expect, it, vi } from "vitest";

const { orderName, orderSort, limit } = vi.hoisted(() => {
  const limit = vi.fn();
  const orderName = vi.fn(() => ({ limit }));
  const orderSort = vi.fn(() => ({ order: orderName }));
  return { orderName, orderSort, limit };
});

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({ order: orderSort })),
    })),
  })),
}));

import { getPublicPartners } from "@/data/partners";

describe("getPublicPartners", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("splits active and historical partners from the public view", async () => {
    limit.mockResolvedValue({
      data: [
        {
          id: "1",
          name: "Active Co",
          org: null,
          type: "mentors",
          link: null,
          logo_url: null,
          is_active: true,
          sort_order: 1,
        },
        {
          id: "2",
          name: "Past Co",
          org: null,
          type: "corporate",
          link: null,
          logo_url: null,
          is_active: false,
          sort_order: 2,
        },
      ],
      error: null,
    });

    const result = await getPublicPartners();
    expect(result.active.map((p) => p.name)).toEqual(["Active Co"]);
    expect(result.historical.map((p) => p.name)).toEqual(["Past Co"]);
  });
});
