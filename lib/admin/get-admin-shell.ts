import { cache } from "react";

import { getStaffShell, type StaffShell } from "@/lib/admin/get-staff-shell";

export type AdminShell = {
  isAdmin: boolean;
  isEditor: boolean;
  role: StaffShell["role"];
  fullName: string | null;
  email: string | null;
};

/**
 * Compat shell via expanded `get_admin_shell` columns.
 * Prefer `getStaffShell` (`get_staff_shell`) for new callers — both share the
 * same request-memoized staff shell so layout + gates stay one RPC.
 */
export const getAdminShell = cache(async (): Promise<AdminShell> => {
  const shell = await getStaffShell();
  return {
    isAdmin: shell.isAdmin,
    isEditor: shell.isEditor,
    role: shell.role,
    fullName: shell.fullName,
    email: shell.email,
  };
});
