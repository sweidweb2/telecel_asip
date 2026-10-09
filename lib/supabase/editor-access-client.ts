import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Cookie-free Supabase client for an editor access token.
 * Use this inside `unstable_cache` so the callback does not call `cookies()`.
 * The token must stay in a closure, not in the cache key.
 */
export function createAccessTokenClient(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}
