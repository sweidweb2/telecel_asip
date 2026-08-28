import { cache } from "react";
import { redirect } from "next/navigation";

import { publicPath } from "@/constants/routes";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { createClient } from "@/lib/supabase/server";

/** Returns the signed-in Auth user, or null when logged out. */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
});

/**
 * DB-backed admin check. Uses `is_admin()` only (auth.uid from JWT) —
 * skips a redundant getUser() round trip after middleware already refreshed the session.
 */
export const isCurrentUserAdmin = cache(async (): Promise<boolean> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_admin");
  if (error) throw error;
  return Boolean(data);
});

/**
 * Admin gate for dashboard routes. Sends non-admins (including self-serve
 * signups, which `handle_new_user` assigns the `viewer` role) to the
 * marketing home rather than the admin shell.
 */
export async function requireAdmin(): Promise<void> {
  if (await isCurrentUserAdmin()) return;
  redirect(publicPath(await getRequestLocale()));
}
