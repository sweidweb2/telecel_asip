import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AdminStatCardItem = {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  /** Coral mark when this count is the thing that needs action. */
  accent?: boolean;
};

/**
 * Four (or fewer) equal icon+count cards above admin list tables.
 * Matches inbox / users list chrome.
 */
export function AdminStatsCards({ items }: { items: AdminStatCardItem[] }) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        const needsAction = Boolean(item.accent) && item.value > 0;
        return (
          <Card
            key={item.key}
            size="sm"
            className="min-w-0 bg-card py-0"
          >
            <CardContent className="flex flex-row items-center gap-2 py-3 sm:gap-2.5 sm:py-4">
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  needsAction
                    ? "text-[var(--portal-accent)]"
                    : "text-muted-foreground",
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">
                  {item.label}
                </p>
                <p
                  className={cn(
                    "text-lg font-semibold tracking-tight tabular-nums sm:text-xl",
                    needsAction && "text-[var(--portal-accent)]",
                  )}
                >
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
