/**
 * Restrict post-auth redirects to same-origin relative paths.
 * Rejects missing values, protocol-relative URLs (`//evil`), and absolute URLs.
 * Callers pass an explicit fallback (usually the locale home).
 */
export function safeRedirectPath(
  path: string | undefined | null,
  fallback: string,
): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}
