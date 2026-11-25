import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  consumeRateLimit,
  consumeSharedRateLimit,
  consumeStaffMutationRateLimit,
  isRateLimited,
  recordRateLimitHit,
  releaseRateLimitHit,
  releaseSharedRateLimit,
  resetRateLimitBuckets,
} from "@/lib/rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    resetRateLimitBuckets();
  });

  it("allows up to the limit then blocks", () => {
    const key = "test:key";
    const windowMs = 60_000;
    expect(consumeRateLimit(key, 2, windowMs, 1_000)).toBe(true);
    expect(consumeRateLimit(key, 2, windowMs, 1_001)).toBe(true);
    expect(consumeRateLimit(key, 2, windowMs, 1_002)).toBe(false);
  });

  it("peek does not record hits", () => {
    const key = "test:peek";
    expect(isRateLimited(key, 1, 60_000, 1_000)).toBe(false);
    expect(isRateLimited(key, 1, 60_000, 1_000)).toBe(false);
    recordRateLimitHit(key, 60_000, 1_000);
    expect(isRateLimited(key, 1, 60_000, 1_001)).toBe(true);
  });

  it("expires hits outside the window", () => {
    const key = "test:expire";
    expect(consumeRateLimit(key, 1, 1_000, 0)).toBe(true);
    expect(consumeRateLimit(key, 1, 1_000, 1_001)).toBe(true);
  });

  it("falls back to in-memory for public shared limits on RPC error", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: { message: "rpc down", code: "57014" },
    }));
    const admin = { rpc } as never;

    await expect(
      consumeSharedRateLimit(admin, "public:key", 1, 60_000),
    ).resolves.toBe(true);
    await expect(
      consumeSharedRateLimit(admin, "public:key", 1, 60_000),
    ).resolves.toBe(false);
  });

  it("fails closed for staff mutation limits on RPC error", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: { message: "rpc down", code: "57014" },
    }));
    const admin = { rpc } as never;

    await expect(
      consumeStaffMutationRateLimit(admin, "user-1", "userCreate"),
    ).resolves.toBe(false);
  });

  it("refunds the latest in-memory hit", () => {
    const key = "test:refund";
    expect(consumeRateLimit(key, 1, 60_000, 1_000)).toBe(true);
    expect(consumeRateLimit(key, 1, 60_000, 1_001)).toBe(false);
    releaseRateLimitHit(key);
    expect(consumeRateLimit(key, 1, 60_000, 1_002)).toBe(true);
  });

  it("falls back to in-memory refund when release RPC fails", async () => {
    const rpc = vi.fn(async () => ({
      data: null,
      error: { message: "rpc down", code: "57014" },
    }));
    const admin = { rpc } as never;
    const key = "public:refund";

    await expect(
      consumeSharedRateLimit(admin, key, 1, 60_000),
    ).resolves.toBe(true);
    await releaseSharedRateLimit(admin, key);
    await expect(
      consumeSharedRateLimit(admin, key, 1, 60_000),
    ).resolves.toBe(true);
  });
});
