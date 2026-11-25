import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { ProfileType } from "@/types/profile";
import type { RegisterAccountType } from "@/validations/auth";

/** New Google signups only — avoid flipping type on every return login. */
const NEW_PROFILE_WINDOW_MS = 5 * 60 * 1000;

type AuthCallbackProfileSlice = {
  role: string;
  type: ProfileType;
  created_at: string;
};

/**
 * Apply Google signup `account_type` to brand-new viewer profiles only.
 * Route-handler helper — takes the same Supabase client that exchanged the
 * OAuth code so the session stays visible.
 */
export async function applyGoogleSignupAccountType(options: {
  supabase: SupabaseClient<Database>;
  userId: string;
  accountType: RegisterAccountType;
  profile: AuthCallbackProfileSlice;
}): Promise<void> {
  const { supabase, userId, accountType, profile } = options;

  if (
    profile.role !== "viewer" ||
    profile.type === "admin" ||
    profile.type === accountType
  ) {
    return;
  }

  const createdAt = Date.parse(profile.created_at);
  const isRecent =
    Number.isFinite(createdAt) &&
    Date.now() - createdAt < NEW_PROFILE_WINDOW_MS;
  if (!isRecent) return;

  const { error } = await supabase
    .from("profiles")
    .update({ type: accountType })
    .eq("id", userId);

  if (error) {
    console.error(
      "[auth/callback] failed to apply account_type",
      error.message,
    );
  }
}
