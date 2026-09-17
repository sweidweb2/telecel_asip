import {
  authorizeRole,
  type AuthorizeRoleMessages,
  type StaffActionSession,
} from "@/lib/admin/authorize-role";

export type AuthorizeAdminMessages = AuthorizeRoleMessages;
export type AdminSession = StaffActionSession;

/**
 * Session + admin gate for dashboard Server Actions.
 * Uses request-cached `getStaffShell` via `isCurrentUserAdmin`; callers pass entity-specific copy.
 */
export async function authorizeAdmin(
  messages: AuthorizeAdminMessages,
): Promise<AdminSession> {
  return authorizeRole("admin", messages);
}
