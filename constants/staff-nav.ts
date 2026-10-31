/**
 * Shared active-state helper for editor and admin sidebars.
 * The shell root (`rootHref`) is exact-only so it does not steal active state
 * from every nested page.
 */
export function isStaffNavActive(
  pathname: string,
  href: string,
  rootHref: string,
) {
  if (href === rootHref) {
    return pathname === rootHref;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
