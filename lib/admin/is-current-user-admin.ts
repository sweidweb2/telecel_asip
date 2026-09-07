import { cache } from "react";

import { getAdminShell } from "@/lib/admin/get-admin-shell";

/**
 * DB-backed admin check via cached `getAdminShell` (`get_admin_shell` RPC).
 * Shares one request-memoized shell with the dashboard layout — no second `is_admin` RPC.
 */
export const isCurrentUserAdmin = cache(async (): Promise<boolean> => {
  const shell = await getAdminShell();
  return shell.isAdmin;
});
