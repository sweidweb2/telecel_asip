import { cache } from "react";

import { getStaffShell } from "@/lib/admin/get-staff-shell";

/** Role gate used by Server Actions and page-data loaders. */
export type StaffRoleGate = "admin" | "editor" | "staff";

/**
 * DB-backed admin check via cached `getStaffShell` (`get_staff_shell` RPC).
 * Shares one request-memoized shell with staff layouts — no second role RPC.
 */
export const isCurrentUserAdmin = cache(async (): Promise<boolean> => {
  const shell = await getStaffShell();
  return shell.isAdmin;
});

/**
 * DB-backed editor check via cached `getStaffShell` (`get_staff_shell` RPC).
 * True only for `profiles.role = editor` (admins are not editors).
 */
export const isCurrentUserEditor = cache(async (): Promise<boolean> => {
  const shell = await getStaffShell();
  return shell.isEditor;
});

/**
 * True when the signed-in user is admin or editor (staff shells / Users list).
 */
export const isCurrentUserStaff = cache(async (): Promise<boolean> => {
  const shell = await getStaffShell();
  return shell.isAdmin || shell.isEditor;
});

const ROLE_CHECKS = {
  admin: isCurrentUserAdmin,
  editor: isCurrentUserEditor,
  staff: isCurrentUserStaff,
} as const;

/** Shared role predicate for `authorizeRole` and `gatePageDataByRole`. */
export async function checkStaffRole(role: StaffRoleGate): Promise<boolean> {
  return ROLE_CHECKS[role]();
}
