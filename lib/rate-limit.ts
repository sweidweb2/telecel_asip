/**
 * Rate limiting for public form actions.
 *
 * Prefer the Postgres `consume_rate_limit` RPC (shared across instances via
 * service role). Public intake may fall back to an in-process Map when the RPC
 * is unavailable (local tests / migration not applied) — always logged.
 * Staff mutations fail closed on RPC errors.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const windows = new Map<string, number[]>();

function prune(key: string, cutoff: number): number[] {
  const prior = (windows.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
  windows.set(key, prior);
  return prior;
}

/** True when the key is already at or over the limit (does not record). */
export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): boolean {
  const prior = prune(key, now - windowMs);
  return prior.length >= limit;
}

/** Records one attempt for the key (call only after all checks pass). */
export function recordRateLimitHit(
  key: string,
  windowMs: number,
  now = Date.now(),
): void {
  const prior = prune(key, now - windowMs);
  prior.push(now);
  windows.set(key, prior);
}

/**
 * @returns true if the action is allowed (and records this attempt)
 */
export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now(),
): boolean {
  if (isRateLimited(key, limit, windowMs, now)) return false;
  recordRateLimitHit(key, windowMs, now);
  return true;
}

type AdminClient = SupabaseClient<Database>;

export type ConsumeSharedRateLimitOptions = {
  /**
   * When true, RPC errors deny the attempt (staff / sensitive paths).
   * When false (default), falls back to in-memory for public forms.
   */
  failClosed?: boolean;
};

/**
 * Shared rate limit via `public.consume_rate_limit`.
 * Returns true when the attempt is allowed.
 */
export async function consumeSharedRateLimit(
  admin: AdminClient,
  key: string,
  limit: number,
  windowMs: number,
  options?: ConsumeSharedRateLimitOptions,
): Promise<boolean> {
  const { data, error } = await admin.rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_ms: windowMs,
  });

  if (error) {
    console.error("[rate-limit] consume_rate_limit RPC failed", {
      key,
      failClosed: Boolean(options?.failClosed),
      message: error.message,
      code: error.code,
    });
    if (options?.failClosed) {
      return false;
    }
    // Public forms only: degrade to in-memory (single instance).
    return consumeRateLimit(key, limit, windowMs);
  }

  return Boolean(data);
}

/** Drop the newest in-memory hit for a key (local fallback refund). */
export function releaseRateLimitHit(key: string): void {
  const prior = windows.get(key);
  if (!prior || prior.length === 0) return;
  prior.pop();
  windows.set(key, prior);
}

/**
 * Refund the latest hit for a shared rate-limit key after a failed insert.
 * Best-effort: logs and continues when the RPC is unavailable.
 */
export async function releaseSharedRateLimit(
  admin: AdminClient,
  key: string,
): Promise<void> {
  const { error } = await admin.rpc("release_rate_limit", {
    p_key: key,
  });

  if (error) {
    console.error("[rate-limit] release_rate_limit RPC failed", {
      key,
      message: error.message,
      code: error.code,
    });
    // Keep in-memory buckets consistent when the RPC is missing locally.
    releaseRateLimitHit(key);
  }
}

/** Test helper — clears all in-memory buckets. */
export function resetRateLimitBuckets(): void {
  windows.clear();
}

export const STAFF_MUTATION_WINDOW_MS = 60 * 60 * 1000;

/** Shared hourly caps for sensitive staff mutations (per userId). */
export const STAFF_RATE_LIMITS = {
  userCreate: 20,
  userDelete: 20,
  userHardDelete: 10,
  backupCreate: 10,
} as const;

/**
 * Rate-limit a staff mutation by acting user id.
 * Returns true when the attempt is allowed. Fails closed if the shared RPC errors.
 */
export async function consumeStaffMutationRateLimit(
  admin: AdminClient,
  userId: string,
  action: keyof typeof STAFF_RATE_LIMITS,
): Promise<boolean> {
  return consumeSharedRateLimit(
    admin,
    `staff:${action}:${userId}`,
    STAFF_RATE_LIMITS[action],
    STAFF_MUTATION_WINDOW_MS,
    { failClosed: true },
  );
}
