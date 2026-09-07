import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export type AdminStatCardItem = {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
};

/**
 * Four (or fewer) equal icon+count cards above admin list tables.
 * Matches inbox / users list chrome.
 */
export function AdminStatsCards({ items }: { items: AdminStatCardItem[] }) {
  return (
    <div className="flex w-full flex-row flex-nowrap gap-2 sm:gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.key}
            size="sm"
            className="min-w-0 flex-1 basis-0 py-0"
          >
            <CardContent className="flex flex-row items-center gap-2 py-3 sm:gap-2.5 sm:py-4">
              <Icon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-lg font-semibold tracking-tight tabular-nums sm:text-xl">
                  {item.value}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
