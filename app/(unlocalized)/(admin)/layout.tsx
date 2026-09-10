import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { StaffHeader } from "@/components/dashboard/staff-header";
import { StaffKeyboardShortcuts } from "@/components/dashboard/staff-keyboard-shortcuts";
import { SkipToContent } from "@/components/dashboard/skip-to-content";
import { StaffOfflineBanner } from "@/components/dashboard/staff-offline-banner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ADMIN_NAV_GROUPS } from "@/constants/admin-nav";
import { publicPath, ROUTES } from "@/constants/routes";
import { getStaffShell } from "@/data/admin-shell";
import { setAdminPerfRoute, traceAsync } from "@/lib/admin/perf";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { userDisplayName, userInitials } from "@/lib/user-display";
import type { DashboardAccount } from "@/types/profile";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const shell = await traceAsync(
    "adminLayout",
    { eventType: "layout", meta: { ops: ["getStaffShell"] } },
    () => getStaffShell(),
  );

  if (shell.isEditor) {
    redirect(ROUTES.dashboard);
  }

  if (!shell.isAdmin) {
    redirect(publicPath(await getRequestLocale()));
  }

  const email = shell.email ?? "";
  const account: DashboardAccount = {
    name: userDisplayName(shell.fullName, email),
    email,
    initials: userInitials(shell.fullName, email),
  };

  setAdminPerfRoute("/admin");

  return (
    <SidebarProvider>
      <SkipToContent />
      <StaffKeyboardShortcuts />
      <AppSidebar
        homeHref={ROUTES.admin}
        brandLabel="Admin panel"
        navGroups={ADMIN_NAV_GROUPS}
      />
      <SidebarInset>
        <StaffOfflineBanner />
        <StaffHeader
          account={account}
          panelLabel="Admin panel"
          titleResolver="admin"
        />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
