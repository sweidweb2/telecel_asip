import { beforeEach, describe, expect, it, vi } from "vitest";

const { publicMaybeSingle, serverMaybeSingle, rpcMock } = vi.hoisted(() => ({
  publicMaybeSingle: vi.fn(),
  serverMaybeSingle: vi.fn(),
  rpcMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

vi.mock("@/lib/admin/is-current-user-admin", () => ({
  isCurrentUserAdmin: vi.fn(),
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: publicMaybeSingle })),
      })),
    })),
  })),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle: serverMaybeSingle })),
      })),
    })),
    rpc: rpcMock,
  })),
}));

import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import {
  getNewsletterSignupEnabled,
  getOpenApplications,
  getSiteSettingsForAdmin,
} from "@/data/settings";

describe("site settings reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(true);
  });

  it("maps open flags and backup_time for admin via RPC", async () => {
    serverMaybeSingle.mockResolvedValue({
      data: {
        open_applications: true,
        newsletter_signup_enabled: false,
      },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: "weekly_sun_03", error: null });
    publicMaybeSingle.mockResolvedValue({
      data: {
        open_applications: true,
        newsletter_signup_enabled: false,
      },
      error: null,
    });

    await expect(getSiteSettingsForAdmin()).resolves.toEqual({
      openApplications: true,
      newsletterSignupEnabled: false,
      backupTime: "weekly_sun_03",
    });
    expect(rpcMock).toHaveBeenCalledWith("get_admin_backup_schedule");
    await expect(getOpenApplications()).resolves.toBe(true);
    await expect(getNewsletterSignupEnabled()).resolves.toBe(false);
  });

  it("skips backup schedule RPC for non-admins", async () => {
    vi.mocked(isCurrentUserAdmin).mockResolvedValue(false);
    serverMaybeSingle.mockResolvedValue({
      data: {
        open_applications: false,
        newsletter_signup_enabled: true,
      },
      error: null,
    });

    await expect(getSiteSettingsForAdmin()).resolves.toEqual({
      openApplications: false,
      newsletterSignupEnabled: true,
      backupTime: "weekly_sun_03",
    });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("falls back to closed defaults when the row is missing", async () => {
    serverMaybeSingle.mockResolvedValue({ data: null, error: null });
    publicMaybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(getSiteSettingsForAdmin()).resolves.toEqual({
      openApplications: false,
      newsletterSignupEnabled: false,
      backupTime: "weekly_sun_03",
    });
  });
});
