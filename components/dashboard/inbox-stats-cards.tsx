import {
  CalendarDaysIcon,
  CircleCheckIcon,
  InboxIcon,
  MailIcon,
} from "lucide-react";

import { AdminStatsCards } from "@/components/dashboard/admin-stats-cards";
import type { InboxTableStats } from "@/data/inbox-stats";

/** Inbox list stats. Unread is the action count. */
export function InboxStatsCards({ stats }: { stats: InboxTableStats }) {
  return (
    <AdminStatsCards
      items={[
        { key: "total", label: "Total", value: stats.total, icon: InboxIcon },
        {
          key: "unread",
          label: "Unread",
          value: stats.unread,
          icon: MailIcon,
          accent: true,
        },
        {
          key: "reviewed",
          label: "Reviewed",
          value: stats.reviewed,
          icon: CircleCheckIcon,
        },
        {
          key: "last7Days",
          label: "Last 7 days",
          value: stats.last7Days,
          icon: CalendarDaysIcon,
        },
      ]}
    />
  );
}
