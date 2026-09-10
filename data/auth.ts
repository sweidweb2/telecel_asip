import { redirect } from "next/navigation";

import { publicPath } from "@/constants/routes";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
import { getRequestLocale } from "@/lib/i18n/request-locale";

export { getAuthUser } from "@/lib/admin/get-auth-user";
export { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
export { isCurrentUserEditor } from "@/lib/admin/is-current-user-editor";
export { isCurrentUserStaff } from "@/lib/admin/is-current-user-staff";

/**
 * Editor gate for `/dashboard` CMS routes. Sends non-editors (including admins,
 * who use `/admin`, and viewers) away from the editor shell.
 */
export async function requireEditor(): Promise<void> {
  if (await isCurrentUserEditor()) return;
  redirect(publicPath(await getRequestLocale()));
}

/**
 * Admin gate for `/admin` routes. Sends non-admins to the marketing home.
 */
export async function requireAdmin(): Promise<void> {
  if (await isCurrentUserAdmin()) return;
  redirect(publicPath(await getRequestLocale()));
}
