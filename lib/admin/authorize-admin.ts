import { createClient } from "@/lib/supabase/server";

export type AuthorizeAdminMessages = {
  signedInRequired: string;
  unauthorized: string;
};

export type AdminSession =
  | {
      status: "success";
      userId: string;
      supabase: Awaited<ReturnType<typeof createClient>>;
    }
  | { status: "error"; message: string };

/**
 * Session + `is_admin()` gate for dashboard Server Actions.
 * Callers pass entity-specific unauthorized / signed-in copy.
 */
export async function authorizeAdmin(
  messages: AuthorizeAdminMessages,
): Promise<AdminSession> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "error", message: messages.signedInRequired };
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) {
    return { status: "error", message: messages.unauthorized };
  }

  return { status: "success", userId: user.id, supabase };
}
