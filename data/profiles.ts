import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { ProfileType, UserRole } from "@/types/profile";

/** Narrow profile slice for the OAuth callback (role landing + signup type). */
export type AuthCallbackProfile = {
  role: UserRole;
  type: ProfileType;
  created_at: string;
};

/**
 * Profile for post-OAuth redirects. Must use the same client that just ran
 * `exchangeCodeForSession` so the new session is visible.
 */
export async function getAuthCallbackProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AuthCallbackProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, type, created_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
