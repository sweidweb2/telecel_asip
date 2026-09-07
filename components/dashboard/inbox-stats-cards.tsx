import type { LucideIcon } from "lucide-react";
import {
  CalendarDaysIcon,
  CircleCheckIcon,
  InboxIcon,
  MailIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { InboxTableStats } from "@/data/inbox-stats";

const STATS: {
  key: keyof InboxTableStats;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "total", label: "Total", icon: InboxIcon },
  { key: "unread", label: "Unread", icon: MailIcon },
  { key: "reviewed", label: "Reviewed", icon: CircleCheckIcon },
  { key: "last7Days", label: "Last 7 days", icon: CalendarDaysIcon },
];

/**
 * Four icon stat cards for inbox list pages (applications / registrations / contact).
 */
export function InboxStatsCards({ stats }: { stats: InboxTableStats }) {
  return (
    <div className="flex w-full flex-row flex-nowrap gap-2 sm:gap-3">
      {STATS.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.key}
            size="sm"
            className="min-w-0 flex-1 basis-0 py-0"
          >
            <CardContent className="flex flex-row items-center gap-2 py-3 sm:gap-2.5 sm:py-4">
              <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-lg font-semibold tracking-tight tabular-nums sm:text-xl">
                  {stats[stat.key]}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
