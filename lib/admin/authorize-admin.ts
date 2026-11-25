import {
  authorizeRole,
  type AuthorizeRoleMessages,
  type StaffActionSession,
} from "@/lib/admin/authorize-role";

export type AuthorizeAdminMessages = AuthorizeRoleMessages;
export type AdminSession = StaffActionSession;

/** Session + admin gate for dashboard Server Actions. */
export async function authorizeAdmin(
  messages: AuthorizeAdminMessages,
): Promise<AdminSession> {
  return authorizeRole("admin", messages);
}
