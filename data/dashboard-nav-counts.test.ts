import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
const getSession = vi.fn();
const isCurrentUserEditor = vi.fn();
const createSupabaseClient = vi.fn((...args: unknown[]) => {
  void args;
  return { rpc };
});

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: <T extends (...args: never[]) => unknown>(fn: T) => fn };
});

vi.mock("next/cache", () => ({
  unstable_cache:
    (fn: () => unknown) =>
    () =>
      fn(),
}));

vi.mock("@/lib/admin/is-current-user-editor", () => ({
  isCurrentUserEditor: () => isCurrentUserEditor(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getSession },
  })),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: (...args: unknown[]) => createSupabaseClient(...args),
}));

import { getDashboardNavCounts } from "@/data/dashboard-nav-counts";
import { ROUTES } from "@/constants/routes";

describe("getDashboardNavCounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    isCurrentUserEditor.mockResolvedValue(true);
    getSession.mockResolvedValue({
      data: { session: { access_token: "editor-token" } },
    });
  });

  it("returns mapped href counts from the RPC", async () => {
    rpc.mockResolvedValue({
      data: { blogs: 3, partners: 1, profiles: 8 },
      error: null,
    });

    const counts = await getDashboardNavCounts();

    expect(rpc).toHaveBeenCalledWith("get_dashboard_nav_counts");
    expect(createSupabaseClient).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({
        global: { headers: { Authorization: "Bearer editor-token" } },
      }),
    );
    expect(counts[ROUTES.blogs]).toBe(3);
    expect(counts[ROUTES.partners]).toBe(1);
    expect(counts[ROUTES.users]).toBe(8);
  });

  it("returns empty badges when the caller is not an editor", async () => {
    isCurrentUserEditor.mockResolvedValue(false);

    await expect(getDashboardNavCounts()).resolves.toEqual({});
    expect(rpc).not.toHaveBeenCalled();
    expect(getSession).not.toHaveBeenCalled();
  });

  it("returns empty badges when the session has no access token", async () => {
    getSession.mockResolvedValue({ data: { session: null } });

    await expect(getDashboardNavCounts()).resolves.toEqual({});
    expect(rpc).not.toHaveBeenCalled();
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

  it("throws when the RPC fails for another reason", async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { code: "XX000", message: "db down" },
    });

    await expect(getDashboardNavCounts()).rejects.toThrow("db down");
  });
});
