import { cache } from "react";

import { getStaffShell } from "@/lib/admin/get-staff-shell";

/**
 * DB-backed editor check via cached `getStaffShell` (`get_staff_shell` RPC).
 * True only for `profiles.role = editor` (admins are not editors).
 */
export const isCurrentUserEditor = cache(async (): Promise<boolean> => {
  const shell = await getStaffShell();
  return shell.isEditor;
});
