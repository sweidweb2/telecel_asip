import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AdminStatCardItem = {
  key: string;
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Coral mark when this count is the thing that needs action. */
  accent?: boolean;
  href?: string;
};

function needsAction(accent: boolean | undefined, value: number | string) {
  return Boolean(accent) && typeof value === "number" && value > 0;
}

function gridClass(count: number) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-3";
  return "grid-cols-2 sm:grid-cols-4";
}

/** Label + figure used by stat cards and grouped analytics counts. */
export function AdminStatFigure({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-lg font-semibold tracking-tight tabular-nums sm:text-xl",
          needsAction(accent, value) && "text-[var(--portal-accent)]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * Equal icon+count cards above portal lists.
 * Four cards are 2×2 on a phone and one row from `sm`.
 */
export function AdminStatsCards({ items }: { items: AdminStatCardItem[] }) {
  return (
    <div className={cn("grid w-full gap-2 sm:gap-3", gridClass(items.length))}>
      {items.map((item) => {
        const Icon = item.icon;
        const highlight = needsAction(item.accent, item.value);
        const card = (
          <Card size="sm" className="h-full min-w-0 bg-card py-0">
            <CardContent className="flex h-full flex-row items-center gap-2 py-3 sm:gap-2.5 sm:py-4">
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  highlight
                    ? "text-[var(--portal-accent)]"
                    : "text-muted-foreground",
                )}
                aria-hidden
              />
              <AdminStatFigure
                label={item.label}
                value={item.value}
                accent={item.accent}
              />
            </CardContent>
          </Card>
        );

        if (!item.href) {
          return <div key={item.key}>{card}</div>;
        }

        return (
          <Link
            key={item.key}
            href={item.href}
            className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {card}
          </Link>
        );
      })}
    </div>
  );
}
