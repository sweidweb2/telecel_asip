import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? "127.0.0.1" : null),
  })),
}));

vi.mock("@/lib/i18n/request-locale", () => ({
  getRequestLocale: vi.fn(async () => "en" as const),
}));

vi.mock("@/data/settings", () => ({
  getNewsletterSignupEnabled: vi.fn(),
}));

vi.mock("@/lib/turnstile", () => ({
  verifyTurnstileToken: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  isRateLimited: vi.fn(() => false),
  recordRateLimitHit: vi.fn(),
}));

const insertMock = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: insertMock,
    })),
  })),
}));

import { subscribeNewsletter } from "@/actions/newsletter";
import { getNewsletterSignupEnabled } from "@/data/settings";
import { verifyTurnstileToken } from "@/lib/turnstile";

const validInput = {
  email: "founder@example.com",
  consent: true,
  sourcePage: "/en/insights",
  turnstileToken: "test-token",
};

describe("subscribeNewsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockResolvedValue({ error: null });
  });

  it("rejects when the signup toggle is off", async () => {
    vi.mocked(getNewsletterSignupEnabled).mockResolvedValue(false);

    const result = await subscribeNewsletter(validInput);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/not open/i);
    }
    expect(verifyTurnstileToken).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("accepts a valid payload when the toggle is on", async () => {
    vi.mocked(getNewsletterSignupEnabled).mockResolvedValue(true);
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);

    const result = await subscribeNewsletter(validInput);

    expect(result.status).toBe("success");
    expect(verifyTurnstileToken).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledWith({
      email: "founder@example.com",
      consent: true,
      source_page: "/en/insights",
    });
  });
});
