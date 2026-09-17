import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StaffShellLayout } from "@/components/dashboard/staff-shell-layout";
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
    <StaffShellLayout
      account={account}
      homeHref={ROUTES.admin}
      brandLabel="Admin panel"
      panelLabel="Admin panel"
      navGroups={ADMIN_NAV_GROUPS}
      titleResolver="admin"
    >
      {children}
    </StaffShellLayout>
  );
}
