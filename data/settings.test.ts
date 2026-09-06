import { beforeEach, describe, expect, it, vi } from "vitest";

const { maybeSingle } = vi.hoisted(() => ({
  maybeSingle: vi.fn(),
}));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}));

vi.mock("@/lib/supabase/public", () => ({
  createPublicClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ maybeSingle })),
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

  it("maps open flags from the singleton row", async () => {
    maybeSingle.mockResolvedValue({
      data: {
        open_applications: true,
        newsletter_signup_enabled: false,
      },
      error: null,
    });

    await expect(getSiteSettingsForAdmin()).resolves.toEqual({
      openApplications: true,
      newsletterSignupEnabled: false,
    });
    await expect(getOpenApplications()).resolves.toBe(true);
    await expect(getNewsletterSignupEnabled()).resolves.toBe(false);
  });

  it("falls back to closed defaults when the row is missing", async () => {
    maybeSingle.mockResolvedValue({ data: null, error: null });

    await expect(getSiteSettingsForAdmin()).resolves.toEqual({
      openApplications: false,
      newsletterSignupEnabled: false,
    });
  });
});
