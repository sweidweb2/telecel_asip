import type { ReactNode } from "react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { StaffHeader } from "@/components/dashboard/staff-header";
import { StaffKeyboardShortcuts } from "@/components/dashboard/staff-keyboard-shortcuts";
import { SkipToContent } from "@/components/dashboard/skip-to-content";
import { StaffOfflineBanner } from "@/components/dashboard/staff-offline-banner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { DashboardNavGroup } from "@/constants/dashboard-nav";
import type { DashboardNavCounts } from "@/constants/dashboard-nav-counts";
import type { DashboardAccount } from "@/types/profile";

type StaffShellLayoutProps = {
  children: ReactNode;
  account: DashboardAccount;
  homeHref: string;
  brandLabel: string;
  panelLabel: string;
  navGroups: readonly DashboardNavGroup[];
  titleResolver?: "editor" | "admin";
  countsPromise?: Promise<DashboardNavCounts>;
};

/**
 * Shared chrome for Admin and Editor shells (sidebar, header, skip link,
 * offline banner). Layouts keep role redirects and shell fetch.
 */
export function StaffShellLayout({
  children,
  account,
  homeHref,
  brandLabel,
  panelLabel,
  navGroups,
  titleResolver = "editor",
  countsPromise,
}: StaffShellLayoutProps) {
  return (
    <SidebarProvider data-staff-shell="">
      <SkipToContent />
      <StaffKeyboardShortcuts />
      <AppSidebar
        countsPromise={countsPromise}
        homeHref={homeHref}
        brandLabel={brandLabel}
        navGroups={navGroups}
      />
      <SidebarInset>
        <StaffOfflineBanner />
        <StaffHeader
          account={account}
          panelLabel={panelLabel}
          titleResolver={titleResolver}
        />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
