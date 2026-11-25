import { checkStaffRole, type StaffRoleGate } from "@/lib/admin/current-user-role";
import { getAuthUser } from "@/lib/admin/get-auth-user";
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

export type StaffAuthorizeRole = StaffRoleGate;

/**
 * Session + role gate for staff Server Actions.
 * Uses request-cached `getStaffShell` via `checkStaffRole`.
 */
export async function authorizeRole(
  role: StaffAuthorizeRole,
  messages: AuthorizeRoleMessages,
): Promise<StaffActionSession> {
  try {
    const [user, allowed] = await Promise.all([
      getAuthUser(),
      checkStaffRole(role),
    ]);

    if (!user) {
      return { status: "error", message: messages.signedInRequired };
    }

    if (!allowed) {
      return { status: "error", message: messages.unauthorized };
    }

    const supabase = await createClient();
    return { status: "success", userId: user.id, supabase };
  } catch (error) {
    console.error("[authorizeRole] unexpected failure", error);
    return { status: "error", message: messages.unauthorized };
  }
}

/** Session + admin gate for dashboard Server Actions. */
export function authorizeAdmin(
  messages: AuthorizeRoleMessages,
): Promise<StaffActionSession> {
  return authorizeRole("admin", messages);
}

/** Session + editor gate for CMS / settings / intake Server Actions. */
export function authorizeEditor(
  messages: AuthorizeRoleMessages,
): Promise<StaffActionSession> {
  return authorizeRole("editor", messages);
}

/**
 * Session + staff gate (admin OR editor) for Users list mutations shared by both shells.
 * Hard-delete and other admin-only paths should keep using `authorizeAdmin`.
 */
export function authorizeStaff(
  messages: AuthorizeRoleMessages,
): Promise<StaffActionSession> {
  return authorizeRole("staff", messages);
}
