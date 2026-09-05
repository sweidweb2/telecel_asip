import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * DB-backed admin check. Uses `is_admin()` only (auth.uid from JWT).
 * Request-memoized so layout `requireAdmin` and page `data/` share one RPC.
 */
export const isCurrentUserAdmin = cache(async (): Promise<boolean> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (error) throw error;
  return Boolean(data);
});
