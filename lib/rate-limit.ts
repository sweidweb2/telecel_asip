/**
 * Rate limiting for public form actions.
 *
 * Prefer the Postgres `consume_rate_limit` RPC (shared across instances via
 * service role). Falls back to an in-process Map only when the RPC is
 * unavailable (local tests / migration not applied).
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

/**
 * Shared rate limit via `public.consume_rate_limit`.
 * Returns true when the attempt is allowed.
 */
export async function consumeSharedRateLimit(
  admin: AdminClient,
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const { data, error } = await admin.rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_ms: windowMs,
  });

  if (error) {
    // Migration not applied or RPC error — degrade to in-memory (single instance).
    return consumeRateLimit(key, limit, windowMs);
  }

  return Boolean(data);
}

/** Test helper — clears all in-memory buckets. */
export function resetRateLimitBuckets(): void {
  windows.clear();
}
