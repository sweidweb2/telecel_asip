import type { Metadata } from "next";
import {
  DatabaseBackupIcon,
  SettingsIcon,
  TimerIcon,
  UsersIcon,
} from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { AdminPortalLinkList } from "@/components/dashboard/admin-portal-link";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/data/auth";

export const metadata: Metadata = {
  title: "Overview | ASIP Admin",
};

export default async function AdminIndexPage() {
  await requireAdmin();

  return (
    <AdminListPageShell title="Overview">
      <AdminPortalLinkList
        items={[
          {
            title: "Users",
            description: "Accounts, roles, and access",
            href: ROUTES.adminUsers,
            icon: UsersIcon,
          },
          {
            title: "Settings",
            description: "Site-wide switches and intake",
            href: ROUTES.adminSettings,
            icon: SettingsIcon,
          },
          {
            title: "Performance",
            description: "Staff route timing and cache events",
            href: ROUTES.adminPerformance,
            icon: TimerIcon,
          },
          {
            title: "Backup",
            description: "Create, schedule, and download exports",
            href: ROUTES.adminBackup,
            icon: DatabaseBackupIcon,
          },
        ]}
      />
    </AdminListPageShell>
  );
}
