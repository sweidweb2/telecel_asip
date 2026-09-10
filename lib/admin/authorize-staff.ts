import {
  authorizeRole,
  type AuthorizeRoleMessages,
  type StaffActionSession,
} from "@/lib/admin/authorize-role";

export type AuthorizeStaffMessages = AuthorizeRoleMessages;
export type StaffSession = StaffActionSession;

/**
 * Session + staff gate (admin OR editor) for Users list mutations shared by both shells.
 * Hard-delete and other admin-only paths should keep using `authorizeAdmin`.
 */
export async function authorizeStaff(
  messages: AuthorizeStaffMessages,
): Promise<StaffSession> {
  return authorizeRole("staff", messages);
}
