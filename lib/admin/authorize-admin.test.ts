import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/get-auth-user", () => ({
  getAuthUser: vi.fn(),
}));

vi.mock("@/lib/admin/is-current-user-admin", () => ({
  isCurrentUserAdmin: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ mocked: true })),
}));

vi.mock("@/lib/admin/perf", () => ({
  traceAsync: vi.fn(async (_name: string, _attrs: unknown, fn: () => Promise<unknown>) =>
    fn(),
  ),
  isAdminPerfTrackingEnabled: vi.fn(() => false),
}));

import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { createClient } from "@/lib/supabase/server";

const messages = {
  signedInRequired: "You must be signed in.",
  unauthorized: "You do not have permission.",
};

describe("authorizeAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns signed-in required when there is no user", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(false);

    const result = await authorizeAdmin(messages);

    expect(result).toEqual({
      status: "error",
      message: messages.signedInRequired,
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns unauthorized when the user is not an admin", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: "user-1" } as never);
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(false);

    const result = await authorizeAdmin(messages);

    expect(result).toEqual({
      status: "error",
      message: messages.unauthorized,
    });
  });

  it("returns a session for admins", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: "admin-1" } as never);
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(true);

    const result = await authorizeAdmin(messages);

    expect(result).toEqual({
      status: "success",
      userId: "admin-1",
      supabase: { mocked: true },
    });
  });
});
