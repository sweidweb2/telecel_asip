import type { Metadata } from "next";
import Link from "next/link";
import {
  DatabaseBackupIcon,
  SettingsIcon,
  TimerIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/data/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Overview | ASIP Admin",
};

const QUICK_LINKS: {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}[] = [
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
];

export default async function AdminIndexPage() {
  await requireAdmin();

  return (
    <AdminListPageShell title="Overview">
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "h-auto min-h-11 w-full items-start justify-start gap-3 px-4 py-4 whitespace-normal",
                )}
              >
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 text-left">
                  <span className="block font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-sm font-normal text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </AdminListPageShell>
  );
}
