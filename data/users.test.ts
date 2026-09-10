import { beforeEach, describe, expect, it, vi } from "vitest";

const isCurrentUserStaff = vi.fn();
const getStaffShell = vi.fn();
const range = vi.fn();
const orderId = vi.fn();
const orderCreated = vi.fn();
const eqRole = vi.fn();
const neqRole = vi.fn();
const or = vi.fn();
const select = vi.fn();
const rpc = vi.fn();
const from = vi.fn(() => ({ select }));

function chainable(extra: Record<string, unknown> = {}) {
  return {
    order: orderCreated,
    eq: eqRole,
    neq: neqRole,
    or,
    range,
    ...extra,
  };
}

vi.mock("@/lib/admin/is-current-user-staff", () => ({
  isCurrentUserStaff: (...args: unknown[]) => isCurrentUserStaff(...args),
}));

vi.mock("@/lib/admin/get-staff-shell", () => ({
  getStaffShell: (...args: unknown[]) => getStaffShell(...args),
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
    getStaffShell.mockResolvedValue({
      role: "admin",
      isAdmin: true,
      isEditor: false,
      fullName: "Ada",
      email: "ada@example.com",
    });
    select.mockImplementation(() => chainable());
    orderCreated.mockImplementation(() =>
      chainable({ order: orderId }),
    );
    orderId.mockImplementation(() => chainable());
    neqRole.mockImplementation(() => chainable());
    eqRole.mockImplementation(() => chainable());
    or.mockImplementation(() => chainable());
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
    expect(neqRole).not.toHaveBeenCalled();
  });

  it("excludes admin profiles when the actor is an editor", async () => {
    isCurrentUserStaff.mockResolvedValue(true);
    getStaffShell.mockResolvedValue({
      role: "editor",
      isAdmin: false,
      isEditor: true,
      fullName: "Ed",
      email: "ed@example.com",
    });
    range.mockResolvedValue({
      data: [
        {
          id: "u2",
          email: "ed@example.com",
          full_name: "Ed",
          role: "editor",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      ],
      error: null,
      count: 1,
    });
    rpc.mockResolvedValue({
      data: {
        total: 8,
        admins: 0,
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
      role: "admin",
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(neqRole).toHaveBeenCalledWith("role", "admin");
    expect(eqRole).not.toHaveBeenCalled();
    expect(result.stats.admins).toBe(0);
  });
});
