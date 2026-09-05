import { ADMIN_RESOURCES } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";

export const DASHBOARD_NAV_ITEMS = [
  { title: "Dashboard", href: ROUTES.dashboard },
  { title: ADMIN_RESOURCES.users.navTitle, href: ROUTES.users },
  {
    title: ADMIN_RESOURCES.registrations.navTitle,
    href: ROUTES.registrations,
  },
  {
    title: ADMIN_RESOURCES.applications.navTitle,
    href: ROUTES.applications,
  },
  { title: ADMIN_RESOURCES.portfolio.navTitle, href: ROUTES.portfolio },
  { title: ADMIN_RESOURCES.blogs.navTitle, href: ROUTES.blogs },
  { title: ADMIN_RESOURCES.cohorts.navTitle, href: ROUTES.cohorts },
  { title: ADMIN_RESOURCES.partners.navTitle, href: ROUTES.partners },
  {
    title: ADMIN_RESOURCES.founderStories.navTitle,
    href: ROUTES.founderStories,
  },
  { title: ADMIN_RESOURCES.evidence.navTitle, href: ROUTES.evidence },
  {
    title: ADMIN_RESOURCES.impactMetrics.navTitle,
    href: ROUTES.impactMetrics,
  },
  { title: ADMIN_RESOURCES.events.navTitle, href: ROUTES.events },
  { title: ADMIN_RESOURCES.contactUs.navTitle, href: ROUTES.contactUs },
  { title: "Analytics", href: ROUTES.analytics },
  { title: "Backup", href: ROUTES.backup },
  { title: "Settings", href: ROUTES.settings },
] as const;

export function getDashboardPageTitle(pathname: string) {
  return (
    DASHBOARD_NAV_ITEMS.find((item) => item.href === pathname)?.title ??
    "Dashboard"
  );
}
