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

function mockPublicListRow(id: string, name: string) {
  return {
    id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    logo_url: null,
    description: `${name} description`,
    founded_at: null,
    cohort: "2024",
    country_code: "GH",
    sector: "Fintech",
    founder_names: ["Founder"],
    cover_image_url: null,
    public_outcome: null,
    featured: false,
    image_focal_x: 50,
    image_focal_y: 50,
  };
}

describe("getActiveStartupsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads matching ids first, then wide columns only for the page slice", async () => {
    const idsOrder = vi.fn().mockResolvedValue({
      data: [{ id: "a" }, { id: "b" }, { id: "c" }],
      error: null,
    });
    const idsSelect = vi.fn(() => ({ order: idsOrder }));

    const pageIn = vi.fn().mockImplementation((_column: string, ids: string[]) => ({
      data: ids.map((id) =>
        mockPublicListRow(
          id,
          ({ a: "Alpha", b: "Beta", c: "Charlie" } as Record<string, string>)[id] ??
            id,
        ),
      ),
      error: null,
    }));
    const pageSelect = vi.fn(() => ({ in: pageIn }));

    from
      .mockReturnValueOnce({ select: idsSelect })
      .mockReturnValueOnce({ select: pageSelect });

    const result = await getActiveStartupsPage(
      1,
      {
        cohort: null,
        country: null,
        sector: null,
        query: "",
      },
      0,
    );

    expect(from).toHaveBeenNthCalledWith(1, "startups_public");
    expect(idsSelect).toHaveBeenCalledWith("id");
    expect(from).toHaveBeenNthCalledWith(2, "startups_public");
    expect(pageSelect).toHaveBeenCalledWith(
      expect.stringContaining("public_outcome"),
    );

    const pageIds = pageIn.mock.calls[0]?.[1] as string[];
    expect(pageIds).toHaveLength(3);
    expect(new Set(pageIds)).toEqual(new Set(["a", "b", "c"]));
    expect(result.total).toBe(3);
    // Page rows are re-ordered to match the shuffled id slice, not DB order.
    expect(result.items.map((item) => item.id)).toEqual(pageIds);
  });

  it("does not fetch list columns when the matching id set is empty", async () => {
    const idsOrder = vi.fn().mockResolvedValue({ data: [], error: null });
    from.mockReturnValue({
      select: vi.fn(() => ({ order: idsOrder })),
    });

    const result = await getActiveStartupsPage(1);

    expect(from).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith("startups_public");
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("requests wide columns only for the current page of ids", async () => {
    const manyIds = Array.from({ length: 30 }, (_, index) => ({
      id: `id-${String(index).padStart(2, "0")}`,
    }));
    const idsOrder = vi.fn().mockResolvedValue({ data: manyIds, error: null });
    const idsSelect = vi.fn(() => ({ order: idsOrder }));

    const pageIn = vi.fn().mockImplementation((_column: string, ids: string[]) => ({
      data: ids.map((id) => mockPublicListRow(id, id)),
      error: null,
    }));
    const pageSelect = vi.fn(() => ({ in: pageIn }));

    from
      .mockReturnValueOnce({ select: idsSelect })
      .mockReturnValueOnce({ select: pageSelect });

    const result = await getActiveStartupsPage(1);

    const pageIds = pageIn.mock.calls[0]?.[1] as string[];
    expect(pageIds).toHaveLength(result.pageSize);
    expect(result.total).toBe(30);
    expect(result.totalPages).toBe(3);
    expect(result.items).toHaveLength(result.pageSize);
  });
});
