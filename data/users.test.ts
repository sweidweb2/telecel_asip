import { beforeEach, describe, expect, it, vi } from "vitest";

const isCurrentUserStaff = vi.fn();
const range = vi.fn();
const orderId = vi.fn(() => ({ range }));
const orderCreated = vi.fn(() => ({ order: orderId }));
const eqRole = vi.fn(() => ({ range, order: orderCreated, or: vi.fn() }));
const or = vi.fn(() => ({ range }));
const select = vi.fn(() => ({
  order: orderCreated,
  eq: eqRole,
  or,
  range,
}));
const rpc = vi.fn();
const from = vi.fn(() => ({ select }));

vi.mock("@/lib/admin/is-current-user-staff", () => ({
  isCurrentUserStaff: (...args: unknown[]) => isCurrentUserStaff(...args),
}));

vi.mock("@/lib/admin/perf", () => ({
  traceAsync: (_name: string, _attrs: unknown, fn: () => unknown) => fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from, rpc })),
}));

import { getUsersPageData } from "@/data/users";

describe("getUsersPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderCreated.mockImplementation(() => ({
      order: orderId,
      range,
      eq: eqRole,
      or,
    }));
    orderId.mockImplementation(() => ({ range, eq: eqRole, or }));
    select.mockImplementation(() => ({
      order: orderCreated,
      eq: eqRole,
      or,
      range,
    }));
  });

  it("returns forbidden for non-staff", async () => {
    isCurrentUserStaff.mockResolvedValue(false);
    range.mockResolvedValue({ data: [], error: null, count: 0 });
    rpc.mockResolvedValue({ data: null, error: null });

    const result = await getUsersPageData({
      page: 1,
      pageSize: 10,
      search: "",
      role: "all",
    });
    expect(result.status).toBe("forbidden");
  });

  it("returns users list and mapped stats for staff", async () => {
    isCurrentUserStaff.mockResolvedValue(true);
    range.mockResolvedValue({
      data: [
        {
          id: "u1",
          email: "ada@example.com",
          full_name: "Ada",
          role: "admin",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      error: null,
      count: 1,
    });
    rpc.mockResolvedValue({
      data: {
        total: 10,
        admins: 2,
        editors: 3,
        viewers: 5,
        new_this_week: 1,
        new_this_month: 4,
      },
      error: null,
    });

    const result = await getUsersPageData({
      page: 1,
      pageSize: 10,
      search: "",
      role: "all",
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.list.users[0]?.email).toBe("ada@example.com");
    expect(result.stats).toEqual({
      total: 10,
      admins: 2,
      editors: 3,
      viewers: 5,
      newThisWeek: 1,
      newThisMonth: 4,
    });
  });
});
