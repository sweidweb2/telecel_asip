import { beforeEach, describe, expect, it, vi } from "vitest";

const { publicMaybeSingle, serverMaybeSingle } = vi.hoisted(() => ({
  publicMaybeSingle: vi.fn(),
  serverMaybeSingle: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
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
  })),
}));

import {
  getNewsletterSignupEnabled,
  getOpenApplications,
  getSiteSettingsForAdmin,
} from "@/data/settings";

describe("site settings reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps open flags and backup_time for admin", async () => {
    serverMaybeSingle.mockResolvedValue({
      data: {
        open_applications: true,
        newsletter_signup_enabled: false,
        backup_time: "weekly_sun_03",
      },
      error: null,
    });
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
    await expect(getOpenApplications()).resolves.toBe(true);
    await expect(getNewsletterSignupEnabled()).resolves.toBe(false);
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
