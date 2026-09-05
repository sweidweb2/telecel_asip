import { ROUTES } from "@/constants/routes";

export const DASHBOARD_NAV_ITEMS = [
  { title: "Dashboard", href: ROUTES.dashboard },
  { title: "Manage users", href: ROUTES.users },
  { title: "Manage registrations", href: ROUTES.registrations },
  { title: "Manage applications", href: ROUTES.applications },
  { title: "Manage portfolio", href: ROUTES.portfolio },
  { title: "Manage blogs", href: ROUTES.blogs },
  { title: "Manage cohorts", href: ROUTES.cohorts },
  { title: "Manage partners", href: ROUTES.partners },
  { title: "Manage founder stories", href: ROUTES.founderStories },
  { title: "Manage evidence", href: ROUTES.evidence },
  { title: "Manage impact metrics", href: ROUTES.impactMetrics },
  { title: "Manage events", href: ROUTES.events },
  { title: "Manage contact us", href: ROUTES.contactUs },
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
