import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * CI builds (`.github/workflows/ci.yml`) fall back to this host when Supabase
 * secrets are missing. Marketing SSG must not DNS-fail against it.
 */
export const PLACEHOLDER_SUPABASE_HOST = "placeholder.supabase.co";

export function isPlaceholderSupabaseUrl(
  url = process.env.NEXT_PUBLIC_SUPABASE_URL,
): boolean {
  if (!url) return false;
  try {
    return new URL(url).hostname === PLACEHOLDER_SUPABASE_HOST;
  } catch {
    return false;
  }
}

/**
 * Empty PostgREST-shaped success body so list reads return `[]` and
 * `maybeSingle` soft-fails into existing defaults (e.g. site settings)
 * without touching the network.
 */
function placeholderFetch(): typeof fetch {
  return async () =>
    new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Content-Range": "*/0",
      },
    });
}

/**
 * Cookie-free anon client for public, cacheable reads (e.g. published blogs).
 * Do not use for authenticated admin queries.
 *
 * When `NEXT_PUBLIC_SUPABASE_URL` is the CI placeholder host, network calls are
 * stubbed so `next build` can prerender marketing pages without secrets.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    ...(isPlaceholderSupabaseUrl(url)
      ? { global: { fetch: placeholderFetch() } }
      : {}),
  });
}
