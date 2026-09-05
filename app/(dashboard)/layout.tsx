import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { publicPath } from "@/constants/routes";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getCurrentUserProfile } from "@/data/users";
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
  const [isAdmin, profile] = await Promise.all([
    isCurrentUserAdmin(),
    getCurrentUserProfile(),
  ]);

  if (!isAdmin) {
    redirect(publicPath(await getRequestLocale()));
  }

  const account: DashboardAccount = {
    name: profile ? userDisplayName(profile.full_name, profile.email) : "Admin",
    email: profile?.email ?? "",
    initials: profile ? userInitials(profile.full_name, profile.email) : "AD",
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader account={account} />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
