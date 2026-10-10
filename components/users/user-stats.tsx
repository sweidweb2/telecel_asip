import {
  CalendarDaysIcon,
  CalendarRangeIcon,
  ShieldCheckIcon,
  UsersIcon,
} from "lucide-react";

import { AdminStatsCards } from "@/components/dashboard/admin-stats-cards";
import type { UserStats } from "@/types/profile";

export function UserStatsCards({
  stats,
  actorRole = "admin",
}: {
  stats: UserStats;
  actorRole?: "admin" | "editor";
}) {
  const items = [
    {
      key: "total",
      label: "Total users",
      value: stats.total,
      icon: UsersIcon,
    },
    ...(actorRole === "admin"
      ? [
          {
            key: "admins",
            label: "Admins",
            value: stats.admins,
            icon: ShieldCheckIcon,
          },
        ]
      : []),
    {
      key: "newThisWeek",
      label: "New this week",
      value: stats.newThisWeek,
      icon: CalendarDaysIcon,
    },
    {
      key: "newThisMonth",
      label: "New this month",
      value: stats.newThisMonth,
      icon: CalendarRangeIcon,
    },
  ];

  return <AdminStatsCards items={items} />;
}
