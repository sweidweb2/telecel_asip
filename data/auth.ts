import { createClient } from "@/lib/supabase/server";

/** Returns the signed-in Auth user, or null when logged out. */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

export async function isAuthenticated() {
  const user = await getAuthUser();
  return user !== null;
}
