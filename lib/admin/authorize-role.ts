import { getAuthUser } from "@/lib/admin/get-auth-user";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { isCurrentUserStaff } from "@/lib/admin/is-current-user-staff";
import { createClient } from "@/lib/supabase/server";

export type AuthorizeRoleMessages = {
  signedInRequired: string;
  unauthorized: string;
};

export type StaffActionSession =
  | {
      status: "success";
      userId: string;
      supabase: Awaited<ReturnType<typeof createClient>>;
    }
  | { status: "error"; message: string };

export type StaffAuthorizeRole = "admin" | "editor" | "staff";

const ROLE_CHECKS = {
  admin: isCurrentUserAdmin,
  editor: isCurrentUserEditor,
  staff: isCurrentUserStaff,
} as const;

/**
 * Session + role gate for staff Server Actions.
 * Uses request-cached `getStaffShell` via the matching `isCurrentUser*` helper.
 */
export async function authorizeRole(
  role: StaffAuthorizeRole,
  messages: AuthorizeRoleMessages,
): Promise<StaffActionSession> {
  const [user, allowed] = await Promise.all([
    getAuthUser(),
    ROLE_CHECKS[role](),
  ]);

  if (!user) {
    return { status: "error", message: messages.signedInRequired };
  }

  if (!allowed) {
    return { status: "error", message: messages.unauthorized };
  }

  const supabase = await createClient();
  return { status: "success", userId: user.id, supabase };
}
