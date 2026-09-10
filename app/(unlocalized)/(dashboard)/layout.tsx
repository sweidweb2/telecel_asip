import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { StaffHeader } from "@/components/dashboard/staff-header";
import { StaffKeyboardShortcuts } from "@/components/dashboard/staff-keyboard-shortcuts";
import { SkipToContent } from "@/components/dashboard/skip-to-content";
import { StaffOfflineBanner } from "@/components/dashboard/staff-offline-banner";
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

  const email = shell.email ?? "";
  const account: DashboardAccount = {
    name: userDisplayName(shell.fullName, email),
    email,
    initials: userInitials(shell.fullName, email),
  };

  setAdminPerfRoute("/dashboard");

  const navCountsPromise = getDashboardNavCounts();

  return (
    <SidebarProvider>
      <SkipToContent />
      <StaffKeyboardShortcuts />
      <AppSidebar
        countsPromise={navCountsPromise}
        homeHref={ROUTES.dashboard}
        brandLabel="Editor panel"
        navGroups={DASHBOARD_NAV_GROUPS}
      />
      <SidebarInset>
        <StaffOfflineBanner />
        <StaffHeader account={account} panelLabel="Editor panel" />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
