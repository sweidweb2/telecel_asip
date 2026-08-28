/**
 * Display helpers for the signed-in user. `profiles` has no avatar column, so
 * the dashboard chrome shows initials derived from the name (or email).
 */

/** Name to show in the sidebar/header, falling back to the email local part. */
export function userDisplayName(
  fullName: string | null | undefined,
  email: string,
): string {
  const trimmed = fullName?.trim();
  if (trimmed) return trimmed;

  const localPart = email.split("@")[0]?.trim();
  return localPart || email;
}

/** 1–2 letters for the avatar fallback. */
export function userInitials(
  fullName: string | null | undefined,
  email: string,
): string {
  const source = userDisplayName(fullName, email);
  const parts = source.split(/[\s._-]+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }

  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}
