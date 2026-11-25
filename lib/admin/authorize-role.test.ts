import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/get-auth-user", () => ({
  getAuthUser: vi.fn(),
}));

vi.mock("@/lib/admin/is-current-user-admin", () => ({
  isCurrentUserAdmin: vi.fn(),
}));

vi.mock("@/lib/admin/is-current-user-editor", () => ({
  isCurrentUserEditor: vi.fn(),
}));

vi.mock("@/lib/admin/is-current-user-staff", () => ({
  isCurrentUserStaff: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ mocked: true })),
}));

import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { authorizeEditor } from "@/lib/admin/authorize-editor";
import { authorizeRole } from "@/lib/admin/authorize-role";
import { authorizeStaff } from "@/lib/admin/authorize-staff";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { isCurrentUserStaff } from "@/lib/admin/is-current-user-staff";
import { createClient } from "@/lib/supabase/server";

const messages = {
  signedInRequired: "You must be signed in.",
  unauthorized: "You do not have permission.",
};

describe("authorizeRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["admin", isCurrentUserAdmin],
    ["editor", isCurrentUserEditor],
    ["staff", isCurrentUserStaff],
  ] as const)("gates %s role correctly", async (role, check) => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(check).mockResolvedValue(true);

    const result = await authorizeRole(role, messages);

    expect(result).toEqual({
      status: "success",
      userId: "u1",
      supabase: { mocked: true },
    });
    expect(createClient).toHaveBeenCalled();
  });

  it("returns unauthorized when the role check fails", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(isCurrentUserEditor).mockResolvedValue(false);

    const result = await authorizeRole("editor", messages);

    expect(result).toEqual({
      status: "error",
      message: messages.unauthorized,
    });
    expect(createClient).not.toHaveBeenCalled();
  });
});

describe.each([
  ["authorizeAdmin", authorizeAdmin, isCurrentUserAdmin],
  ["authorizeEditor", authorizeEditor, isCurrentUserEditor],
  ["authorizeStaff", authorizeStaff, isCurrentUserStaff],
] as const)("%s wrapper", (_name, authorize, check) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns signed-in required when there is no user", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    vi.mocked(check).mockResolvedValue(false);

    const result = await authorize(messages);

    expect(result).toEqual({
      status: "error",
      message: messages.signedInRequired,
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns unauthorized when the role check fails", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(check).mockResolvedValue(false);

    const result = await authorize(messages);

    expect(result).toEqual({
      status: "error",
      message: messages.unauthorized,
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns a session when the role check passes", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(check).mockResolvedValue(true);

    const result = await authorize(messages);

    expect(result).toEqual({
      status: "success",
      userId: "u1",
      supabase: { mocked: true },
    });
  });
});
