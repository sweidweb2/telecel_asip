import { ADMIN_RESOURCES } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";

export type DashboardNavItem = {
  title: string;
  href: string;
};

export type DashboardNavGroup = {
  label: string;
  items: readonly DashboardNavItem[];
};

/**
 * Sidebar destinations that are live, grouped for scanability.
 */
export const DASHBOARD_NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: ROUTES.dashboard }],
  },
  {
    label: "Pipeline",
    items: [
      {
        title: ADMIN_RESOURCES.registrations.navTitle,
        href: ROUTES.registrations,
      },
      {
        title: ADMIN_RESOURCES.applications.navTitle,
        href: ROUTES.applications,
      },
      { title: ADMIN_RESOURCES.contactUs.navTitle, href: ROUTES.contactUs },
    ],
  },
  {
    label: "Founders",
    items: [
      { title: ADMIN_RESOURCES.cohorts.navTitle, href: ROUTES.cohorts },
      {
        title: ADMIN_RESOURCES.founderStories.navTitle,
        href: ROUTES.founderStories,
      },
    ],
  },
  {
    label: "Content",
    items: [
      { title: ADMIN_RESOURCES.blogs.navTitle, href: ROUTES.blogs },
      { title: ADMIN_RESOURCES.portfolio.navTitle, href: ROUTES.portfolio },
      { title: ADMIN_RESOURCES.partners.navTitle, href: ROUTES.partners },
    ],
  },
  {
    label: "Programme",
    items: [
      { title: ADMIN_RESOURCES.events.navTitle, href: ROUTES.events },
      { title: ADMIN_RESOURCES.evidence.navTitle, href: ROUTES.evidence },
      {
        title: ADMIN_RESOURCES.impactMetrics.navTitle,
        href: ROUTES.impactMetrics,
      },
    ],
  },
  {
    label: "System",
    items: [
      { title: ADMIN_RESOURCES.users.navTitle, href: ROUTES.users },
      { title: "Analytics", href: ROUTES.analytics },
      { title: "Performance", href: ROUTES.performance },
      { title: "Backup", href: ROUTES.backup },
      { title: "Settings", href: ROUTES.settings },
    ],
  },
] as const satisfies readonly DashboardNavGroup[];

/** Flat list for title resolution and icon maps. */
export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] =
  DASHBOARD_NAV_GROUPS.flatMap((group) => [...group.items]);

/** Page search catalog: nav title + group for header typeahead. */
export type DashboardSearchPage = {
  title: string;
  href: string;
  group: string;
};

export const DASHBOARD_SEARCH_PAGES: readonly DashboardSearchPage[] =
  DASHBOARD_NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      title: item.title,
      href: item.href,
      group: group.label,
    })),
  );

/** Extra titles for routes that exist but are not primary nav items. */
const DASHBOARD_EXTRA_TITLES: Record<string, string> = {};

/**
 * Whether a sidebar item should show as active for the current pathname.
 * `/dashboard` is exact-only so it does not steal active state from every page.
 */
export function isDashboardNavActive(pathname: string, href: string) {
  if (href === ROUTES.dashboard) {
    return pathname === ROUTES.dashboard;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Header title for the current dashboard pathname.
 * Nested routes (e.g. `/dashboard/blogs/new`) resolve to the parent nav item.
 */
export function getDashboardPageTitle(pathname: string) {
  const extra = DASHBOARD_EXTRA_TITLES[pathname];
  if (extra) return extra;

  const match = [...DASHBOARD_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isDashboardNavActive(pathname, item.href));

  return match?.title ?? "Dashboard";
}
