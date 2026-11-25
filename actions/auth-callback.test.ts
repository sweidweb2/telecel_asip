import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { applyGoogleSignupAccountType } from "@/actions/auth-callback";

describe("applyGoogleSignupAccountType", () => {
  const update = vi.fn();
  const eq = vi.fn(() => ({ error: null as { message: string } | null }));
  const supabase = {
    from: vi.fn(() => ({
      update: (...args: unknown[]) => {
        update(...args);
        return { eq };
      },
    })),
  };

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
      supabase: supabase as never,
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
      supabase: supabase as never,
      userId: "u1",
      accountType: "startup",
      profile: {
        role: "editor",
        type: "investor",
        created_at: "2026-11-25T11:58:00.000Z",
      },
    });
    await applyGoogleSignupAccountType({
      supabase: supabase as never,
      userId: "u1",
      accountType: "startup",
      profile: {
        role: "viewer",
        type: "admin",
        created_at: "2026-11-25T11:58:00.000Z",
      },
    });
    await applyGoogleSignupAccountType({
      supabase: supabase as never,
      userId: "u1",
      accountType: "startup",
      profile: {
        role: "viewer",
        type: "startup",
        created_at: "2026-11-25T11:58:00.000Z",
      },
    });
    await applyGoogleSignupAccountType({
      supabase: supabase as never,
      userId: "u1",
      accountType: "startup",
      profile: {
        role: "viewer",
        type: "investor",
        created_at: "2026-11-25T10:00:00.000Z",
      },
    });

    expect(update).not.toHaveBeenCalled();
  });
});
