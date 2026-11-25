import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => (name === "x-forwarded-for" ? "203.0.113.9" : null),
  })),
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeSharedRateLimit: vi.fn(),
  releaseSharedRateLimit: vi.fn(async () => undefined),
}));

const adminClient = { tag: "admin" };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => adminClient),
}));

import {
  getClientIp,
  guardPublicFormSubmission,
  runGuardedAdminWork,
} from "@/lib/intake/submit-guard";
import {
  consumeSharedRateLimit,
  releaseSharedRateLimit,
} from "@/lib/rate-limit";

describe("getClientIp", () => {
  it("returns the first forwarded address", async () => {
    expect(await getClientIp()).toBe("203.0.113.9");
  });
});

describe("guardPublicFormSubmission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(true);
  });

  it("rejects when either rate limit is exhausted", async () => {
    vi.mocked(consumeSharedRateLimit)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const result = await guardPublicFormSubmission({
      rateLimitPrefix: "application",
      identityKind: "user",
      identity: "user-1",
      messages: {
        rateLimited: "rate-fail",
      },
    });

    expect(result).toEqual({ status: "error", message: "rate-fail" });
    expect(releaseSharedRateLimit).toHaveBeenCalledWith(
      adminClient,
      "application:ip:203.0.113.9",
    );
  });

  it("returns admin client and a release helper on success", async () => {
    const result = await guardPublicFormSubmission({
      rateLimitPrefix: "application",
      identityKind: "user",
      identity: "user-1",
      messages: {
        rateLimited: "rate-fail",
      },
    });

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.ip).toBe("203.0.113.9");
    expect(result.admin).toBe(adminClient);
    expect(typeof result.releaseRateLimits).toBe("function");
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

    await result.releaseRateLimits();
    expect(releaseSharedRateLimit).toHaveBeenCalledWith(
      adminClient,
      "application:ip:203.0.113.9",
    );
    expect(releaseSharedRateLimit).toHaveBeenCalledWith(
      adminClient,
      "application:user:user-1",
    );
  });
});

describe("runGuardedAdminWork", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(consumeSharedRateLimit).mockResolvedValue(true);
  });

  it("refunds quota when the insert returns an error", async () => {
    const guard = await guardPublicFormSubmission({
      rateLimitPrefix: "contact",
      identityKind: "email",
      identity: "a@example.com",
      messages: { rateLimited: "rate-fail" },
    });
    expect(guard.status).toBe("ok");
    if (guard.status !== "ok") return;

    const result = await runGuardedAdminWork(guard, async () => ({
      error: { message: "boom", code: "23505" },
    }));

    expect(result.error?.code).toBe("23505");
    expect(releaseSharedRateLimit).toHaveBeenCalledWith(
      adminClient,
      "contact:ip:203.0.113.9",
    );
    expect(releaseSharedRateLimit).toHaveBeenCalledWith(
      adminClient,
      "contact:email:a@example.com",
    );
  });

  it("keeps quota when the insert succeeds", async () => {
    const guard = await guardPublicFormSubmission({
      rateLimitPrefix: "contact",
      identityKind: "email",
      identity: "a@example.com",
      messages: { rateLimited: "rate-fail" },
    });
    expect(guard.status).toBe("ok");
    if (guard.status !== "ok") return;

    await runGuardedAdminWork(guard, async () => ({ error: null }));

    expect(releaseSharedRateLimit).not.toHaveBeenCalled();
  });
});
