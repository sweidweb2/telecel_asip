import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  adminListRange,
  adminListTotalPages,
  gatePageDataByRole,
} from "@/lib/admin/admin-list-query";

const checkStaffRole = vi.fn();
const createClient = vi.fn();

vi.mock("@/lib/admin/current-user-role", () => ({
  checkStaffRole: (...args: unknown[]) => checkStaffRole(...args),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClient(...args),
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

describe("gatePageDataByRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClient.mockResolvedValue({ tag: "supabase" });
  });

  it("awaits the role check before loading data", async () => {
    const order: string[] = [];

    checkStaffRole.mockImplementation(async () => {
      order.push("role-start");
      await new Promise((resolve) => setTimeout(resolve, 20));
      order.push("role-end");
      return true;
    });

    const result = await gatePageDataByRole("admin", async (supabase) => {
      order.push("load-start");
      expect(supabase).toEqual({ tag: "supabase" });
      order.push("load-end");
      return { rows: [1] };
    });

    expect(result).toEqual({ status: "ok", rows: [1] });
    expect(checkStaffRole).toHaveBeenCalledWith("admin");
    expect(order).toEqual([
      "role-start",
      "role-end",
      "load-start",
      "load-end",
    ]);
  });

  it("returns forbidden without loading when the role check fails", async () => {
    checkStaffRole.mockResolvedValue(false);
    const load = vi.fn(async () => ({ rows: [] }));

    const result = await gatePageDataByRole("admin", load);

    expect(result).toEqual({ status: "forbidden" });
    expect(load).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });
});
