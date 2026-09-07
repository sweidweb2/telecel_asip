import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/** Returns the signed-in Auth user, or null when logged out. Request-memoized. */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
});
