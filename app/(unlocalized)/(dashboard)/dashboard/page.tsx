import type { Metadata } from "next";
import Link from "next/link";
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
import { buttonVariants } from "@/components/ui/button";
import {
  DASHBOARD_NAV_GROUPS,
  type DashboardNavGroup,
} from "@/constants/dashboard-nav";
import { ROUTES } from "@/constants/routes";
import { getAdminAnalytics } from "@/data/admin-analytics";
import { requireEditor } from "@/data/auth";
import { cn } from "@/lib/utils";

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
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              What’s waiting
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Unread items in the intake pipeline.
            </p>
          </div>
          {analytics ? (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {waiting.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-auto min-h-11 w-full flex-col items-start justify-start gap-1 px-4 py-4 whitespace-normal",
                    )}
                  >
                    <span className="text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                      {item.unread}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      unread
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
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
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              {group.label}
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => {
                const Icon = NAV_ICONS[item.href] ?? BriefcaseIcon;
                const description =
                  RESOURCE_BLURB[item.href] ?? "Open this section.";
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-auto min-h-11 w-full items-start justify-start gap-3 px-4 py-4 whitespace-normal",
                      )}
                    >
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 text-left">
                        <span className="block font-medium text-foreground">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block text-sm font-normal text-muted-foreground text-pretty">
                          {description}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </AdminListPageShell>
  );
}
