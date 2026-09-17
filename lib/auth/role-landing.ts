import type { Locale } from "@/constants/locales";
import { ROUTES, publicPath } from "@/constants/routes";
import type { Database } from "@/types/database";
import { safeRedirectPath } from "@/lib/auth/safe-redirect-path";

export type AppUserRole = Database["public"]["Enums"]["user_role"];

/** Default post-login destination when `?next=` is missing or not allowed. */
export function roleHomePath(role: AppUserRole | null | undefined, locale: Locale): string {
  if (role === "admin") return ROUTES.admin;
  if (role === "editor") return ROUTES.dashboard;
  return publicPath(locale);
}

function isUnder(path: string, root: string) {
  return path === root || path.startsWith(`${root}/`);
}

/** Whether a same-origin path is allowed for this role after login. */
export function isPathAllowedForRole(
  path: string,
  role: AppUserRole | null | undefined,
): boolean {
  if (role === "admin") {
    return isUnder(path, ROUTES.admin);
  }
  if (role === "editor") {
    return isUnder(path, ROUTES.dashboard);
  }
  // Viewers: marketing / public only — never staff shells.
  if (isUnder(path, ROUTES.dashboard) || isUnder(path, ROUTES.admin)) {
    return false;
  }
  return true;
}

/**
 * Resolve post-auth redirect: safe `?next=` wins when allowed for the role;
 * otherwise land on the role home.
 */
export function resolvePostAuthRedirect(options: {
  next: string | undefined | null;
  role: AppUserRole | null | undefined;
  locale: Locale;
}): string {
  const candidate = safeRedirectPath(options.next, roleHomePath(options.role, options.locale));
  if (isPathAllowedForRole(candidate, options.role)) {
    return candidate;
  }
  return roleHomePath(options.role, options.locale);
}
