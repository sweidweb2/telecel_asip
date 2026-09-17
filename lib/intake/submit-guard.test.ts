import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? "203.0.113.9" : null),
  })),
}));

vi.mock("@/lib/turnstile", () => ({
  verifyTurnstileToken: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeSharedRateLimit: vi.fn(),
}));

const adminClient = { tag: "admin" };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => adminClient),
}));

import {
  getClientIp,
  guardPublicFormSubmission,
} from "@/lib/intake/submit-guard";
import { consumeSharedRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

describe("getClientIp", () => {
  it("returns the first forwarded address", async () => {
    expect(await getClientIp()).toBe("203.0.113.9");
  });
});

describe("guardPublicFormSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyTurnstileToken).mockResolvedValue(true);
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(true);
  });

  it("rejects when Turnstile fails", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue(false);

    const result = await guardPublicFormSubmission({
      turnstileToken: "bad",
      expectedAction: "contact",
      rateLimitPrefix: "contact",
      identityKind: "email",
      identity: "a@example.com",
      messages: {
        verificationFailed: "verify-fail",
        rateLimited: "rate-fail",
      },
    });

    expect(result).toEqual({ status: "error", message: "verify-fail" });
    expect(consumeSharedRateLimit).not.toHaveBeenCalled();
  });

  it("rejects when either rate limit is exhausted", async () => {
    vi.mocked(consumeSharedRateLimit)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const result = await guardPublicFormSubmission({
      turnstileToken: "ok",
      expectedAction: "apply",
      rateLimitPrefix: "application",
      identityKind: "user",
      identity: "user-1",
      messages: {
        verificationFailed: "verify-fail",
        rateLimited: "rate-fail",
      },
    });

    expect(result).toEqual({ status: "error", message: "rate-fail" });
  });

  it("returns admin client and distinct rate-limit keys on success", async () => {
    const result = await guardPublicFormSubmission({
      turnstileToken: "ok",
      expectedAction: "apply",
      rateLimitPrefix: "application",
      identityKind: "user",
      identity: "user-1",
      messages: {
        verificationFailed: "verify-fail",
        rateLimited: "rate-fail",
      },
    });

    expect(result).toEqual({
      status: "ok",
      ip: "203.0.113.9",
      admin: adminClient,
    });
    expect(verifyTurnstileToken).toHaveBeenCalledWith({
      token: "ok",
      expectedAction: "apply",
      remoteip: "203.0.113.9",
    });
    expect(consumeSharedRateLimit).toHaveBeenNthCalledWith(
      1,
      adminClient,
      "application:ip:203.0.113.9",
      5,
      60 * 60 * 1000,
    );
    expect(consumeSharedRateLimit).toHaveBeenNthCalledWith(
      2,
      adminClient,
      "application:user:user-1",
      3,
      60 * 60 * 1000,
    );
  });
});
