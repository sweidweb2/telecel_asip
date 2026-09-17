import type { ReactNode } from "react";
import {
  MapPin,
  Rocket,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { AboutStoryStatIcon } from "@/types/marketing-page";
import { cn } from "@/lib/utils";

const STAT_ICONS: Record<AboutStoryStatIcon, LucideIcon> = {
  rocket: Rocket,
  users: Users,
  "map-pin": MapPin,
  star: Star,
};

type StoryStat = {
  icon: AboutStoryStatIcon;
  value: number;
  suffix?: string;
  label: string;
};

function StoryStatItem({ stat }: { stat: StoryStat }) {
  const Icon = STAT_ICONS[stat.icon];

  return (
    <div className="group relative rounded-xl border bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" aria-hidden />
      </div>
      <p className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
        {stat.value}
        {stat.suffix ?? ""}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
      <span
        aria-hidden
        className="mx-auto mt-4 block h-0.5 w-0 max-w-12 bg-primary transition-all duration-300 group-hover:w-full"
      />
    </div>
  );
}

/** Static story metrics — no client count-up island. */
export function StoryStatCounter({ stats }: { stats: StoryStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6">
      {stats.map((stat) => (
        <StoryStatItem key={stat.label} stat={stat} />
      ))}
    </div>
  );
}

export function StoryStatsNotice({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={cn("text-center text-xs text-muted-foreground", className)}>
      {children}
    </p>
  );
}
