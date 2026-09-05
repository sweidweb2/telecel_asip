import { redirect } from "next/navigation";

import { publicPath } from "@/constants/routes";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export { getAuthUser } from "@/lib/admin/get-auth-user";
export { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";

/**
 * Admin gate for dashboard routes. Sends non-admins (including self-serve
 * signups, which `handle_new_user` assigns the `viewer` role) to the
 * marketing home rather than the admin shell.
 */
export async function requireAdmin(): Promise<void> {
  if (await isCurrentUserAdmin()) return;
  redirect(publicPath(await getRequestLocale()));
}
