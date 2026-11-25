import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? "127.0.0.1" : null),
  })),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/i18n/request-locale", () => ({
  getRequestLocale: vi.fn(async () => "en" as const),
}));

vi.mock("@/data/settings", () => ({
  getNewsletterSignupEnabled: vi.fn(),
}));


vi.mock("@/lib/rate-limit", () => ({
  consumeSharedRateLimit: vi.fn(async () => true),
  releaseSharedRateLimit: vi.fn(async () => undefined),
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
import { consumeSharedRateLimit } from "@/lib/rate-limit";

const validInput = {
  email: "founder@example.com",
  consent: true,
  sourcePage: "/en/insights",
};

describe("subscribeNewsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insertMock.mockResolvedValue({ error: null });
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(true);
  });

  it("rejects when the signup toggle is off", async () => {
    vi.mocked(getNewsletterSignupEnabled).mockResolvedValue(false);

    const result = await subscribeNewsletter(validInput);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toMatch(/not open/i);
    }
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects when rate limited", async () => {
    vi.mocked(getNewsletterSignupEnabled).mockResolvedValue(true);
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(false);

    const result = await subscribeNewsletter(validInput);

    expect(result).toEqual({
      status: "error",
      message: "Too many submissions. Please wait and try again later.",
    });
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("accepts a valid payload when the toggle is on", async () => {
    vi.mocked(getNewsletterSignupEnabled).mockResolvedValue(true);

    const result = await subscribeNewsletter(validInput);

    expect(result.status).toBe("success");
    expect(consumeSharedRateLimit).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalledWith({
      email: "founder@example.com",
      consent: true,
      source_page: "/en/insights",
    });
  });
});
