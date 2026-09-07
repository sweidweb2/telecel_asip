import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { publicPath } from "@/constants/routes";
import { getAdminShell } from "@/data/admin-shell";
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
    { eventType: "layout", meta: { ops: ["getAdminShell"] } },
    () => getAdminShell(),
  );

  if (!shell.isAdmin) {
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

  // Hint for nested spans in this request (pathname not always in headers).
  setAdminPerfRoute("/dashboard");

  return (
    <SidebarProvider>
      <AppSidebar counts={navCounts} />
      <SidebarInset>
        <DashboardHeader account={account} />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
