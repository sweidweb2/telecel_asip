import { beforeEach, describe, expect, it, vi } from "vitest";

const isCurrentUserAdmin = vi.fn();
const range = vi.fn();
const orderId = vi.fn(() => ({ range }));
const orderCreated = vi.fn(() => ({ order: orderId }));
const selectBackups = vi.fn(() => ({
  order: orderCreated,
}));
const inProfiles = vi.fn();
const selectProfiles = vi.fn(() => ({ in: inProfiles }));

const from = vi.fn((table: string) => {
  if (table === "backups") {
    return { select: selectBackups };
  }
  return { select: selectProfiles };
});

vi.mock("@/lib/admin/is-current-user-admin", () => ({
  isCurrentUserAdmin: (...args: unknown[]) => isCurrentUserAdmin(...args),
}));

vi.mock("@/lib/admin/perf", () => ({
  traceAsync: (_name: string, _attrs: unknown, fn: () => unknown) => fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from })),
}));

import { getBackupsPageData } from "@/data/backups";

describe("getBackupsPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns forbidden for non-admins", async () => {
    isCurrentUserAdmin.mockResolvedValue(false);
    range.mockResolvedValue({ data: [], error: null, count: 0 });

    const result = await getBackupsPageData({ page: 1, pageSize: 25 });
    expect(result.status).toBe("forbidden");
  });

  it("maps actor names for admin list", async () => {
    isCurrentUserAdmin.mockResolvedValue(true);
    range.mockResolvedValue({
      data: [
        {
          id: "b1",
          created_at: "2026-09-01T00:00:00.000Z",
          user_id: "u1",
          scope: "full",
          format: "json",
          target_tables: null,
          file_path: "x.zip",
          file_size: 10,
          status: "completed",
          error_message: null,
        },
        {
          id: "b2",
          created_at: "2026-09-02T00:00:00.000Z",
          user_id: null,
          scope: "automated",
          format: "json",
          target_tables: null,
          file_path: "y.zip",
          file_size: 20,
          status: "completed",
          error_message: null,
        },
      ],
      error: null,
      count: 2,
    });
    inProfiles.mockResolvedValue({
      data: [{ id: "u1", full_name: "Ada Admin" }],
      error: null,
    });

    const result = await getBackupsPageData({ page: 1, pageSize: 25 });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.total).toBe(2);
    expect(result.backups[0]?.actor_name).toBe("Ada Admin");
    expect(result.backups[1]?.actor_name).toBeNull();
  });
});
