import { createClient } from "@/lib/supabase/server";
import type { ProfileType, UserRole } from "@/types/profile";

/** Narrow profile slice for the OAuth callback (role landing + signup type). */
export type AuthCallbackProfile = {
  role: UserRole;
  type: ProfileType;
  created_at: string;
};

/**
 * Profile for post-OAuth redirects. Call after `exchangeCodeForSession` so
 * the session cookies are already on the request store.
 */
export async function getAuthCallbackProfile(
  userId: string,
): Promise<AuthCallbackProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role, type, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
