import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/admin/get-auth-user", () => ({
  getAuthUser: vi.fn(),
}));

vi.mock("@/lib/admin/is-current-user-editor", () => ({
  isCurrentUserEditor: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ mocked: true })),
}));

vi.mock("@/lib/admin/perf", () => ({
  traceAsync: vi.fn(
    async (_name: string, _attrs: unknown, fn: () => Promise<unknown>) => fn(),
  ),
  isAdminPerfTrackingEnabled: vi.fn(() => false),
}));

import { authorizeEditor } from "@/lib/admin/authorize-editor";
import { getAuthUser } from "@/lib/admin/get-auth-user";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { createClient } from "@/lib/supabase/server";

const messages = {
  signedInRequired: "You must be signed in.",
  unauthorized: "You do not have permission.",
};

describe("authorizeEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns signed-in required when there is no user", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    vi.mocked(isCurrentUserEditor).mockResolvedValue(false);

    const result = await authorizeEditor(messages);

    expect(result).toEqual({
      status: "error",
      message: messages.signedInRequired,
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns unauthorized when the user is not an editor", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(isCurrentUserEditor).mockResolvedValue(false);

    const result = await authorizeEditor(messages);

    expect(result).toEqual({
      status: "error",
      message: messages.unauthorized,
    });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("returns a session when the user is an editor", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ id: "u1" } as never);
    vi.mocked(isCurrentUserEditor).mockResolvedValue(true);

    const result = await authorizeEditor(messages);

    expect(result).toEqual({
      status: "success",
      userId: "u1",
      supabase: { mocked: true },
    });
  });
});
