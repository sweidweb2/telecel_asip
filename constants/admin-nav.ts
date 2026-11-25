import {
  DatabaseBackupIcon,
  LayoutDashboardIcon,
  MapPinnedIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";

import { ADMIN_RESOURCES } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { isStaffNavActive } from "@/constants/staff-nav";
import type {
  DashboardNavGroup,
  DashboardNavItem,
  DashboardSearchPage,
} from "@/constants/dashboard-nav";

/**
 * Admin panel sidebar — Overview, Users, Settings, Backup, Catalog.
 */
export const ADMIN_NAV_GROUPS = [
  {
    label: "Admin",
    items: [
      {
        title: "Overview",
        href: ROUTES.admin,
        icon: LayoutDashboardIcon,
      },
      {
        title: ADMIN_RESOURCES.users.navTitle,
        href: ROUTES.adminUsers,
        icon: UsersIcon,
      },
      {
        title: "Settings",
        href: ROUTES.adminSettings,
        icon: SettingsIcon,
      },
      {
        title: "Backup",
        href: ROUTES.adminBackup,
        icon: DatabaseBackupIcon,
      },
      {
        title: "Catalog",
        href: ROUTES.adminCatalog,
        icon: MapPinnedIcon,
      },
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
  return isStaffNavActive(pathname, href, ROUTES.admin);
}

export function getAdminPageTitle(pathname: string) {
  const match = [...ADMIN_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isAdminNavActive(pathname, item.href));

  return match?.title ?? "Admin";
}
