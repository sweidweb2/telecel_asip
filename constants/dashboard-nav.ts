import {
  BarChart3Icon,
  BookOpenIcon,
  BriefcaseIcon,
  CalendarIcon,
  ChartColumnIcon,
  ClipboardListIcon,
  HandshakeIcon,
  LayoutDashboardIcon,
  MailIcon,
  MailsIcon,
  NewspaperIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  UsersIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";

import { ADMIN_RESOURCES } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { isStaffNavActive } from "@/constants/staff-nav";

export type DashboardNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
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
    items: [
      {
        title: "Dashboard",
        href: ROUTES.dashboard,
        icon: LayoutDashboardIcon,
      },
    ],
  },
  {
    label: "Pipeline",
    items: [
      {
        title: ADMIN_RESOURCES.registrations.navTitle,
        href: ROUTES.registrations,
        icon: UserPlusIcon,
      },
      {
        title: ADMIN_RESOURCES.applications.navTitle,
        href: ROUTES.applications,
        icon: ClipboardListIcon,
      },
      {
        title: ADMIN_RESOURCES.contactUs.navTitle,
        href: ROUTES.contactUs,
        icon: MailIcon,
      },
      {
        title: ADMIN_RESOURCES.newsletter.navTitle,
        href: ROUTES.newsletter,
        icon: MailsIcon,
      },
    ],
  },
  {
    label: "Founders",
    items: [
      {
        title: ADMIN_RESOURCES.cohorts.navTitle,
        href: ROUTES.cohorts,
        icon: UsersRoundIcon,
      },
      {
        title: ADMIN_RESOURCES.founderStories.navTitle,
        href: ROUTES.founderStories,
        icon: BookOpenIcon,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        title: ADMIN_RESOURCES.blogs.navTitle,
        href: ROUTES.blogs,
        icon: NewspaperIcon,
      },
      {
        title: ADMIN_RESOURCES.portfolio.navTitle,
        href: ROUTES.portfolio,
        icon: BriefcaseIcon,
      },
      {
        title: ADMIN_RESOURCES.partners.navTitle,
        href: ROUTES.partners,
        icon: HandshakeIcon,
      },
    ],
  },
  {
    label: "Programme",
    items: [
      {
        title: ADMIN_RESOURCES.events.navTitle,
        href: ROUTES.events,
        icon: CalendarIcon,
      },
      {
        title: ADMIN_RESOURCES.evidence.navTitle,
        href: ROUTES.evidence,
        icon: ShieldCheckIcon,
      },
      {
        title: ADMIN_RESOURCES.impactMetrics.navTitle,
        href: ROUTES.impactMetrics,
        icon: ChartColumnIcon,
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: ADMIN_RESOURCES.users.navTitle,
        href: ROUTES.users,
        icon: UsersIcon,
      },
      {
        title: "Analytics",
        href: ROUTES.analytics,
        icon: BarChart3Icon,
      },
      {
        title: "Settings",
        href: ROUTES.settings,
        icon: SettingsIcon,
      },
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

/** Create-route shortcuts for the editor command palette. */
export const DASHBOARD_SEARCH_ACTIONS: readonly DashboardSearchPage[] = [
  { title: "New blog", href: ROUTES.blogsNew, group: "Actions" },
  { title: "New startup", href: ROUTES.portfolioNew, group: "Actions" },
  { title: "New partner", href: ROUTES.partnersNew, group: "Actions" },
  { title: "New cohort", href: ROUTES.cohortsNew, group: "Actions" },
  { title: "New event", href: ROUTES.eventsNew, group: "Actions" },
  {
    title: "New founder story",
    href: ROUTES.founderStoriesNew,
    group: "Actions",
  },
  { title: "New evidence", href: ROUTES.evidenceNew, group: "Actions" },
  {
    title: "New impact metric",
    href: ROUTES.impactMetricsNew,
    group: "Actions",
  },
];

/** Editor page search = nav pages + create actions. */
export const DASHBOARD_COMMAND_PAGES: readonly DashboardSearchPage[] = [
  ...DASHBOARD_SEARCH_PAGES,
  ...DASHBOARD_SEARCH_ACTIONS,
];

/** Exact create-route titles (header h1). */
const DASHBOARD_CREATE_TITLES: Record<string, string> = {
  [ROUTES.blogsNew]: "New blog",
  [ROUTES.portfolioNew]: "New startup",
  [ROUTES.partnersNew]: "New partner",
  [ROUTES.cohortsNew]: "New cohort",
  [ROUTES.eventsNew]: "New event",
  [ROUTES.founderStoriesNew]: "New founder story",
  [ROUTES.evidenceNew]: "New evidence record",
  [ROUTES.impactMetricsNew]: "New impact metric",
};

/** Edit-route titles when pathname is `/{resource}/{id}` (not the list or `/new`). */
const DASHBOARD_EDIT_TITLES: ReadonlyArray<{ base: string; title: string }> = [
  { base: ROUTES.blogs, title: "Edit blog" },
  { base: ROUTES.portfolio, title: "Edit startup" },
  { base: ROUTES.partners, title: "Edit partner" },
  { base: ROUTES.cohorts, title: "Edit cohort" },
  { base: ROUTES.events, title: "Edit event" },
  { base: ROUTES.founderStories, title: "Edit founder story" },
  { base: ROUTES.evidence, title: "Edit evidence record" },
  { base: ROUTES.impactMetrics, title: "Edit impact metric" },
];

/**
 * Whether a sidebar item should show as active for the current pathname.
 * `/dashboard` is exact-only so it does not steal active state from every page.
 */
export function isDashboardNavActive(pathname: string, href: string) {
  return isStaffNavActive(pathname, href, ROUTES.dashboard);
}

/**
 * Header title for the current dashboard pathname.
 * List routes use nav titles; nested create/edit routes use action titles.
 */
export function getDashboardPageTitle(pathname: string) {
  const createTitle = DASHBOARD_CREATE_TITLES[pathname];
  if (createTitle) return createTitle;

  for (const { base, title } of DASHBOARD_EDIT_TITLES) {
    if (pathname.startsWith(`${base}/`) && pathname !== `${base}/new`) {
      return title;
    }
  }

  const match = [...DASHBOARD_NAV_ITEMS]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) => isDashboardNavActive(pathname, item.href));

  return match?.title ?? "Dashboard";
}
