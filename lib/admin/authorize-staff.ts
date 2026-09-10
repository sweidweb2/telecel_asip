import { getAuthUser } from "@/lib/admin/get-auth-user";
import { isCurrentUserStaff } from "@/lib/admin/is-current-user-staff";
import { traceAsync } from "@/lib/admin/perf";
import { createClient } from "@/lib/supabase/server";

export type AuthorizeStaffMessages = {
  signedInRequired: string;
  unauthorized: string;
};

export type StaffSession =
  | {
      status: "success";
      userId: string;
      supabase: Awaited<ReturnType<typeof createClient>>;
    }
  | { status: "error"; message: string };

/**
 * Session + staff gate (admin OR editor) for Users list mutations shared by both shells.
 * Hard-delete and other admin-only paths should keep using `authorizeAdmin`.
 */
export async function authorizeStaff(
  messages: AuthorizeStaffMessages,
): Promise<StaffSession> {
  return traceAsync(
    "authorizeStaff",
    { eventType: "data_read", cacheStatus: "n_a" },
    async () => {
      const [user, isStaff] = await Promise.all([
        getAuthUser(),
        isCurrentUserStaff(),
      ]);

      if (!user) {
        return { status: "error", message: messages.signedInRequired };
      }

      if (!isStaff) {
        return { status: "error", message: messages.unauthorized };
      }

      const supabase = await createClient();
      return { status: "success", userId: user.id, supabase };
    },
  );
}
