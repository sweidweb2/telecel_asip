import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: <T extends (...args: never[]) => unknown>(fn: T) => fn };
});

vi.mock("@/lib/admin/perf", () => ({
  wrapCached: (_name: string, _opts: unknown, fn: (...args: never[]) => unknown) =>
    fn,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ rpc })),
}));

import { getDashboardNavCounts } from "@/data/dashboard-nav-counts";
import { ROUTES } from "@/constants/routes";

describe("getDashboardNavCounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns mapped href counts from the RPC", async () => {
    rpc.mockResolvedValue({
      data: { blogs: 3, partners: 1, profiles: 8 },
      error: null,
    });

    const counts = await getDashboardNavCounts();

    expect(rpc).toHaveBeenCalledWith("get_dashboard_nav_counts");
    expect(counts[ROUTES.blogs]).toBe(3);
    expect(counts[ROUTES.partners]).toBe(1);
    expect(counts[ROUTES.users]).toBe(8);
  });

  it("returns empty badges when the RPC is missing or forbidden", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { code: "PGRST202", message: "schema cache" },
    });

    await expect(getDashboardNavCounts()).resolves.toEqual({});

    rpc.mockResolvedValue({
      data: null,
      error: { code: "42501", message: "not authorized" },
    });

    await expect(getDashboardNavCounts()).resolves.toEqual({});
  });
});
