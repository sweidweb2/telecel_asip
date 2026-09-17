import { cache } from "react";

import { getStaffShell } from "@/lib/admin/get-staff-shell";

/**
 * True when the signed-in user is admin or editor (staff shells / Users list).
 */
export const isCurrentUserStaff = cache(async (): Promise<boolean> => {
  const shell = await getStaffShell();
  return shell.isAdmin || shell.isEditor;
});
