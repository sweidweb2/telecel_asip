import type { Metadata } from "next";
import {
  BarChart3Icon,
  BookOpenIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClipboardListIcon,
  FileBarChartIcon,
  HandshakeIcon,
  LineChartIcon,
  MailIcon,
  MegaphoneIcon,
  NewspaperIcon,
  SettingsIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { AdminPortalLinkList } from "@/components/dashboard/admin-portal-link";
import { AdminSectionHeading } from "@/components/dashboard/admin-section-heading";
import { AdminStatsCards } from "@/components/dashboard/admin-stats-cards";
import {
  DASHBOARD_NAV_GROUPS,
  type DashboardNavGroup,
} from "@/constants/dashboard-nav";
import { ROUTES } from "@/constants/routes";
import { getAdminAnalytics } from "@/data/admin-analytics";
import { requireEditor } from "@/data/auth";

export const metadata: Metadata = {
  title: "Dashboard | ASIP Editor",
};

const NAV_ICONS: Record<string, LucideIcon> = {
  [ROUTES.registrations]: UserPlusIcon,
  [ROUTES.applications]: ClipboardListIcon,
  [ROUTES.contactUs]: MailIcon,
  [ROUTES.newsletter]: MegaphoneIcon,
  [ROUTES.cohorts]: UsersIcon,
  [ROUTES.founderStories]: BookOpenIcon,
  [ROUTES.blogs]: NewspaperIcon,
  [ROUTES.portfolio]: BriefcaseIcon,
  [ROUTES.partners]: HandshakeIcon,
  [ROUTES.events]: CalendarIcon,
  [ROUTES.evidence]: FileBarChartIcon,
  [ROUTES.impactMetrics]: LineChartIcon,
  [ROUTES.users]: UsersIcon,
  [ROUTES.analytics]: BarChart3Icon,
  [ROUTES.settings]: SettingsIcon,
};

const RESOURCE_BLURB: Partial<Record<string, string>> = {
  [ROUTES.registrations]: "Register Interest leads",
  [ROUTES.applications]: "Official Apply submissions",
  [ROUTES.contactUs]: "Public contact messages",
  [ROUTES.newsletter]: "Update subscribers",
  [ROUTES.cohorts]: "Programme years and linked founders",
  [ROUTES.founderStories]: "Narrative modules",
  [ROUTES.blogs]: "Insights articles",
  [ROUTES.portfolio]: "Startups on the public portfolio",
  [ROUTES.partners]: "Partners and mentors",
  [ROUTES.events]: "Programme events catalogue",
  [ROUTES.evidence]: "Evidence records",
  [ROUTES.impactMetrics]: "Impact metrics",
  [ROUTES.users]: "Accounts and CMS roles",
  [ROUTES.analytics]: "Pipeline and content snapshot",
  [ROUTES.settings]: "Site-wide intake switches",
};

const LAUNCHER_GROUPS: readonly DashboardNavGroup[] =
  DASHBOARD_NAV_GROUPS.filter((group) => group.label !== "Overview");

export default async function DashboardPage() {
  await requireEditor();
  const analyticsResult = await getAdminAnalytics();
  const analytics =
    analyticsResult.status === "ok" ? analyticsResult.analytics : null;

  const waiting = analytics
    ? [
        {
          title: "Registrations",
          href: ROUTES.registrations,
          unread: analytics.registrations.unread,
        },
        {
          title: "Applications",
          href: ROUTES.applications,
          unread: analytics.applications.unread,
        },
        {
          title: "Contact us",
          href: ROUTES.contactUs,
          unread: analytics.contactMessages.unread,
        },
      ]
    : [];

  const hasUnread = waiting.some((item) => item.unread > 0);

  return (
    <AdminListPageShell title="Dashboard">
      <div className="grid gap-8">
        <section className="grid gap-3">
          <div className="min-w-0">
            <AdminSectionHeading>What’s waiting</AdminSectionHeading>
            <p className="mt-1 text-sm text-muted-foreground">
              Unread items in the intake pipeline.
            </p>
          </div>
          {analytics ? (
            <AdminStatsCards
              items={waiting.map((item) => ({
                key: item.href,
                label: item.title,
                value: item.unread,
                icon: NAV_ICONS[item.href] ?? BriefcaseIcon,
                href: item.href,
                accent: true,
              }))}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Could not load inbox counts. Open Registrations, Applications, or
              Contact us from the sidebar.
            </p>
          )}
          {analytics && !hasUnread ? (
            <p className="text-sm text-muted-foreground">
              Inbox is clear — no unread registrations, applications, or contact
              messages.
            </p>
          ) : null}
        </section>

        {LAUNCHER_GROUPS.map((group) => (
          <section key={group.label} className="grid gap-3">
            <AdminSectionHeading>{group.label}</AdminSectionHeading>
            <AdminPortalLinkList
              items={group.items.map((item) => ({
                href: item.href,
                title: item.title,
                description: RESOURCE_BLURB[item.href] ?? "Open this section.",
                icon: NAV_ICONS[item.href] ?? BriefcaseIcon,
              }))}
            />
          </section>
        ))}
      </div>
    </AdminListPageShell>
  );
}
