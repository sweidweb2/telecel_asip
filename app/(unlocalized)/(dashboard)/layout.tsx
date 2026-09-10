import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DASHBOARD_NAV_GROUPS } from "@/constants/dashboard-nav";
import { publicPath, ROUTES } from "@/constants/routes";
import { getStaffShell } from "@/data/admin-shell";
import { getDashboardNavCounts } from "@/data/dashboard-nav-counts";
import { setAdminPerfRoute, traceAsync } from "@/lib/admin/perf";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { userDisplayName, userInitials } from "@/lib/user-display";
import type { DashboardAccount } from "@/types/profile";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const shell = await traceAsync(
    "dashboardLayout",
    { eventType: "layout", meta: { ops: ["getStaffShell"] } },
    () => getStaffShell(),
  );

  if (shell.isAdmin) {
    redirect(ROUTES.admin);
  }

  if (!shell.isEditor) {
    redirect(publicPath(await getRequestLocale()));
  }

  const navCounts = await traceAsync(
    "dashboardNavCounts",
    { eventType: "layout", meta: { ops: ["getDashboardNavCounts"] } },
    () => getDashboardNavCounts(),
  );

  const email = shell.email ?? "";
  const account: DashboardAccount = {
    name: userDisplayName(shell.fullName, email),
    email,
    initials: userInitials(shell.fullName, email),
  };

  setAdminPerfRoute("/dashboard");

  return (
    <SidebarProvider>
      <AppSidebar
        counts={navCounts}
        homeHref={ROUTES.dashboard}
        brandLabel="Editor panel"
        navGroups={DASHBOARD_NAV_GROUPS}
      />
      <SidebarInset>
        <DashboardHeader account={account} panelLabel="Editor panel" />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
