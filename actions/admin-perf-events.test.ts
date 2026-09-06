import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, authorizeAdmin } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  authorizeAdmin: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("@/lib/admin/authorize-admin", () => ({
  authorizeAdmin,
}));

import { deleteOldAdminPerfEvents } from "@/actions/admin-perf-events";

describe("deleteOldAdminPerfEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthorized callers", async () => {
    authorizeAdmin.mockResolvedValue({
      status: "error",
      message: "You do not have permission to manage performance events.",
    });

    await expect(deleteOldAdminPerfEvents()).resolves.toEqual({
      status: "error",
      message: "You do not have permission to manage performance events.",
    });
  });

  it("deletes old rows and revalidates performance", async () => {
    const lt = vi.fn().mockResolvedValue({ error: null });
    const deleteFn = vi.fn(() => ({ lt }));
    authorizeAdmin.mockResolvedValue({
      status: "success",
      userId: "admin-1",
      supabase: {
        from: vi.fn(() => ({ delete: deleteFn })),
      },
    });

    await expect(deleteOldAdminPerfEvents()).resolves.toEqual({
      status: "success",
      message: "Old performance events deleted.",
    });
    expect(lt).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalled();
  });
});
