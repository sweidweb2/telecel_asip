import type { ReactNode } from "react";
import type { Metadata } from "next";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAdmin } from "@/data/auth";
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
  await requireAdmin();

  const profile = await getCurrentUserProfile();
  const account: DashboardAccount = {
    name: profile ? userDisplayName(profile.full_name, profile.email) : "Admin",
    email: profile?.email ?? "",
    initials: profile ? userInitials(profile.full_name, profile.email) : "AD",
  };

  return (
    <SidebarProvider>
      <AppSidebar account={account} />
      <SidebarInset>
        <DashboardHeader account={account} />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
