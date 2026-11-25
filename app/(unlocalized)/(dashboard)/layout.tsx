import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StaffShellLayout } from "@/components/dashboard/staff-shell-layout";
import { publicPath, ROUTES } from "@/constants/routes";
import { getStaffShell } from "@/data/admin-shell";
import { getDashboardNavCounts } from "@/data/dashboard-nav-counts";
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
  const shell = await getStaffShell();

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

  return (
    <StaffShellLayout
      account={account}
      homeHref={ROUTES.dashboard}
      brandLabel="Editor panel"
      panelLabel="Editor panel"
      navKey="dashboard"
      countsPromise={getDashboardNavCounts()}
    >
      {children}
    </StaffShellLayout>
  );
}
