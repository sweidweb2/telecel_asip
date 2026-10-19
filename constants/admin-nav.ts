import { ADMIN_RESOURCES } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import type {
  DashboardNavGroup,
  DashboardNavItem,
  DashboardSearchPage,
} from "@/constants/dashboard-nav";

/**
 * Admin panel sidebar — Overview, Users, Settings, Performance, Backup, Catalog.
 */
export const ADMIN_NAV_GROUPS = [
  {
    label: "Admin",
    items: [
      { title: "Overview", href: ROUTES.admin },
      { title: ADMIN_RESOURCES.users.navTitle, href: ROUTES.adminUsers },
      { title: "Settings", href: ROUTES.adminSettings },
      { title: "Performance", href: ROUTES.adminPerformance },
      { title: "Backup", href: ROUTES.adminBackup },
      { title: "Catalog", href: ROUTES.adminCatalog },
    ],
  },
] as const satisfies readonly DashboardNavGroup[];

export const ADMIN_NAV_ITEMS: readonly DashboardNavItem[] =
  ADMIN_NAV_GROUPS.flatMap((group) => [...group.items]);

export const ADMIN_SEARCH_PAGES: readonly DashboardSearchPage[] =
  ADMIN_NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      title: item.title,
      href: item.href,
      group: group.label,
    })),
  );

export function isAdminNavActive(pathname: string, href: string) {
  if (href === ROUTES.admin) {
    return pathname === ROUTES.admin;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageTitle(pathname: string) {
  const match = [...ADMIN_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isAdminNavActive(pathname, item.href));

  return match?.title ?? "Admin";
}
