import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  adminListRange,
  adminListTotalPages,
  gateAdminPageData,
} from "@/lib/admin/admin-list-query";

const isCurrentUserAdmin = vi.fn();
const createClient = vi.fn();

vi.mock("@/lib/admin/is-current-user-admin", () => ({
  isCurrentUserAdmin: (...args: unknown[]) => isCurrentUserAdmin(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClient(...args),
}));

vi.mock("@/lib/admin/perf", () => ({
  traceAsync: async <T>(_name: string, _attrs: unknown, fn: () => Promise<T>) =>
    fn(),
}));

describe("adminListRange", () => {
  it("returns inclusive bounds for page 1", () => {
    expect(adminListRange(1, 20)).toEqual({ from: 0, to: 19 });
  });

  it("offsets by page size", () => {
    expect(adminListRange(3, 10)).toEqual({ from: 20, to: 29 });
  });
});

describe("adminListTotalPages", () => {
  it("returns at least 1 for empty results", () => {
    expect(adminListTotalPages(0, 20)).toBe(1);
  });

  it("ceils fractional pages", () => {
    expect(adminListTotalPages(21, 20)).toBe(2);
  });
});

describe("gateAdminPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClient.mockResolvedValue({ tag: "supabase" });
  });

  it("awaits the admin check before loading data", async () => {
    const order: string[] = [];

    isCurrentUserAdmin.mockImplementation(async () => {
      order.push("admin-start");
      await new Promise((resolve) => setTimeout(resolve, 20));
      order.push("admin-end");
      return true;
    });

    const result = await gateAdminPageData(async (supabase) => {
      order.push("load-start");
      expect(supabase).toEqual({ tag: "supabase" });
      order.push("load-end");
      return { rows: [1] };
    });

    expect(result).toEqual({ status: "ok", rows: [1] });
    expect(order).toEqual([
      "admin-start",
      "admin-end",
      "load-start",
      "load-end",
    ]);
  });

  it("returns forbidden without loading when the user is not an admin", async () => {
    isCurrentUserAdmin.mockResolvedValue(false);
    const load = vi.fn(async () => ({ rows: [] }));

    const result = await gateAdminPageData(load);

    expect(result).toEqual({ status: "forbidden" });
    expect(load).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });
});
