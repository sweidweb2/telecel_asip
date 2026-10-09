export type AppStaffRole = "admin" | "editor" | "viewer";

/**
 * Role written by Auth Admin (`app_metadata.app_role`). Public clients cannot
 * set this. Missing or unknown values mean the caller must read `profiles`.
 */
export function staffRoleFromAppMetadata(
  appMetadata: { app_role?: unknown } | null | undefined,
): AppStaffRole | null {
  const role = appMetadata?.app_role;
  if (role === "admin" || role === "editor" || role === "viewer") return role;
  return null;
}
