import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/get-auth-user", () => ({
  getAuthUser: vi.fn(),
}));

vi.mock("@/lib/admin/current-user-role", () => ({
  checkStaffRole: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ mocked: true })),
}));

import {
  authorizeAdmin,
  authorizeEditor,
  authorizeRole,
  authorizeStaff,
} from "@/lib/admin/authorize-role";
import { checkStaffRole } from "@/lib/admin/current-user-role";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import { createClient } from "@/lib/supabase/server";

const messages = {
  signedInRequired: "You must be signed in.",
  unauthorized: "You do not have permission.",
};

describe("authorizeRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["admin", "editor", "staff"] as const)(
    "gates %s role correctly",
    async (role) => {
      vi.mocked(getAuthUser).mockResolvedValue({ id: "u1" } as never);
      vi.mocked(checkStaffRole).mockResolvedValue(true);

      const result = await authorizeRole(role, messages);

      expect(result).toEqual({
        status: "success",
        userId: "u1",
        supabase: { mocked: true },
      });
      expect(checkStaffRole).toHaveBeenCalledWith(role);
      expect(createClient).toHaveBeenCalled();
    },
  );

  it("returns unauthorized when the role check fails", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(checkStaffRole).mockResolvedValue(false);

    const result = await authorizeRole("editor", messages);

    expect(result).toEqual({
      status: "error",
      message: messages.unauthorized,
    });
    expect(createClient).not.toHaveBeenCalled();
  });
});

describe.each([
  ["authorizeAdmin", authorizeAdmin, "admin"],
  ["authorizeEditor", authorizeEditor, "editor"],
  ["authorizeStaff", authorizeStaff, "staff"],
] as const)("%s wrapper", (_name, authorize, role) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns signed-in required when there is no user", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    vi.mocked(checkStaffRole).mockResolvedValue(false);

    const result = await authorize(messages);

    expect(result).toEqual({
      status: "error",
      message: messages.signedInRequired,
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns unauthorized when the role check fails", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(checkStaffRole).mockResolvedValue(false);

    const result = await authorize(messages);

    expect(result).toEqual({
      status: "error",
      message: messages.unauthorized,
    });
    expect(checkStaffRole).toHaveBeenCalledWith(role);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns a session when the role check passes", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(checkStaffRole).mockResolvedValue(true);

    const result = await authorize(messages);

    expect(result).toEqual({
      status: "success",
      userId: "u1",
      supabase: { mocked: true },
    });
    expect(checkStaffRole).toHaveBeenCalledWith(role);
  });
});
