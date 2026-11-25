import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { update, eq, createClient } = vi.hoisted(() => {
  const eq = vi.fn(() => ({ error: null as { message: string } | null }));
  const update = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ update }));
  const createClient = vi.fn(async () => ({ from }));
  return { update, eq, createClient };
});

vi.mock("@/lib/supabase/server", () => ({ createClient }));

import { applyGoogleSignupAccountType } from "@/actions/auth-callback";

describe("applyGoogleSignupAccountType", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-25T12:00:00.000Z"));
    vi.clearAllMocks();
    eq.mockReturnValue({ error: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("updates recent viewer profiles when type differs", async () => {
    await applyGoogleSignupAccountType({
      userId: "u1",
      accountType: "startup",
      profile: {
        role: "viewer",
        type: "investor",
        created_at: "2026-11-25T11:58:00.000Z",
      },
    });

    expect(update).toHaveBeenCalledWith({ type: "startup" });
    expect(eq).toHaveBeenCalledWith("id", "u1");
  });

  it("skips non-viewer, admin type, same type, and old profiles", async () => {
    await applyGoogleSignupAccountType({
      userId: "u1",
      accountType: "startup",
      profile: {
        role: "editor",
        type: "investor",
        created_at: "2026-11-25T11:58:00.000Z",
      },
    });
    await applyGoogleSignupAccountType({
      userId: "u1",
      accountType: "startup",
      profile: {
        role: "viewer",
        type: "admin",
        created_at: "2026-11-25T11:58:00.000Z",
      },
    });
    await applyGoogleSignupAccountType({
      userId: "u1",
      accountType: "startup",
      profile: {
        role: "viewer",
        type: "startup",
        created_at: "2026-11-25T11:58:00.000Z",
      },
    });
    await applyGoogleSignupAccountType({
      userId: "u1",
      accountType: "startup",
      profile: {
        role: "viewer",
        type: "investor",
        created_at: "2026-11-25T10:00:00.000Z",
      },
    });

    expect(update).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });
});
