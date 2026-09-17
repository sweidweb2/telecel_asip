import { describe, expect, it, vi } from "vitest";

import {
  fetchAdminListStats,
  mapAdminListStats,
} from "@/data/admin-list-stats";

describe("mapAdminListStats", () => {
  it("coerces numeric jsonb fields and fills missing keys with 0", () => {
    expect(
      mapAdminListStats({ total: 4, published: "2" }, [
        "total",
        "published",
        "draft",
      ]),
    ).toEqual({ total: 4, published: 2, draft: 0 });
  });

  it("returns zeros for empty payloads", () => {
    expect(mapAdminListStats(null, ["total", "unread"])).toEqual({
      total: 0,
      unread: 0,
    });
  });
});

describe("fetchAdminListStats", () => {
  it("calls get_admin_list_stats with the resource key", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: { total: 3, published: 1, draft: 2, featured: 0 },
      error: null,
    });

    const stats = await fetchAdminListStats(
      { rpc } as never,
      "blogs",
      ["total", "published", "draft", "featured"],
    );

    expect(rpc).toHaveBeenCalledWith("get_admin_list_stats", {
      p_resource: "blogs",
    });
    expect(stats).toEqual({
      total: 3,
      published: 1,
      draft: 2,
      featured: 0,
    });
  });

  it("throws on other PostgREST errors", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "42501", message: "not authorized" },
    });

    await expect(
      fetchAdminListStats({ rpc } as never, "blogs", ["total"]),
    ).rejects.toMatchObject({ code: "42501" });
  });

  it("returns zeros when the RPC is not in the schema cache", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "PGRST202", message: "schema cache" },
    });

    await expect(
      fetchAdminListStats({ rpc } as never, "partners", [
        "total",
        "active",
        "historical",
        "logoGranted",
      ]),
    ).resolves.toEqual({
      total: 0,
      active: 0,
      historical: 0,
      logoGranted: 0,
    });
  });
});
