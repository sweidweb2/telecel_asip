import { cache } from "react";

import { getStaffShell } from "@/lib/admin/get-staff-shell";

/**
 * DB-backed admin check via cached `getStaffShell` (`get_staff_shell` RPC).
 * Shares one request-memoized shell with staff layouts — no second role RPC.
 */
export const isCurrentUserAdmin = cache(async (): Promise<boolean> => {
  const shell = await getStaffShell();
  return shell.isAdmin;
});
