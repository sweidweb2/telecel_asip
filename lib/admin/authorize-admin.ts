import { getAuthUser } from "@/lib/admin/get-auth-user";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { traceAsync } from "@/lib/admin/perf";
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
 * Uses request-cached auth helpers; callers pass entity-specific copy.
 */
export async function authorizeAdmin(
  messages: AuthorizeAdminMessages,
): Promise<AdminSession> {
  return traceAsync(
    "authorizeAdmin",
    { eventType: "data_read", cacheStatus: "n_a" },
    async () => {
      const [user, isAdmin] = await Promise.all([
        getAuthUser(),
        isCurrentUserAdmin(),
      ]);

      if (!user) {
        return { status: "error", message: messages.signedInRequired };
      }

      if (!isAdmin) {
        return { status: "error", message: messages.unauthorized };
      }

      const supabase = await createClient();
      return { status: "success", userId: user.id, supabase };
    },
  );
}
