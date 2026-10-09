import type { LucideIcon } from "lucide-react";
import {
  ArchiveIcon,
  BadgeCheckIcon,
  BookOpenIcon,
  CalendarClockIcon,
  CircleDashedIcon,
  ClockIcon,
  FilePenIcon,
  HandshakeIcon,
  ImageIcon,
  InboxIcon,
  LayersIcon,
  LinkIcon,
  NewspaperIcon,
  PauseCircleIcon,
  QuoteIcon,
  ShieldAlertIcon,
  SparklesIcon,
  StarIcon,
} from "lucide-react";

import { AdminStatsCards } from "@/components/dashboard/admin-stats-cards";
import type { BlogListStats } from "@/data/blogs";
import type { CohortListStats } from "@/data/cohorts";
import type { EventListStats } from "@/data/events";
import type { EvidenceListStats } from "@/data/evidence-records";
import type { FounderStoryListStats } from "@/data/founder-stories";
import type { ImpactMetricListStats } from "@/data/impact-metrics";
import type { PartnerListStats } from "@/data/partners";
import type { StartupListStats } from "@/data/startups";

function cardsFrom<T extends Record<string, number>>(
  stats: T,
  config: {
    key: keyof T & string;
    label: string;
    icon: LucideIcon;
    accent?: boolean;
  }[],
) {
  return (
    <AdminStatsCards
      items={config.map((item) => ({
        key: item.key,
        label: item.label,
        value: stats[item.key],
        icon: item.icon,
        accent: item.accent,
      }))}
    />
  );
}

export function BlogStatsCards({ stats }: { stats: BlogListStats }) {
  return cardsFrom(stats, [
    { key: "total", label: "Total", icon: NewspaperIcon },
    { key: "published", label: "Published", icon: BadgeCheckIcon },
    { key: "draft", label: "Draft", icon: FilePenIcon, accent: true },
    { key: "featured", label: "Featured", icon: StarIcon },
  ]);
}

export function PartnerStatsCards({ stats }: { stats: PartnerListStats }) {
  return cardsFrom(stats, [
    { key: "total", label: "Total", icon: HandshakeIcon },
    { key: "active", label: "Active", icon: SparklesIcon },
    { key: "historical", label: "Historical", icon: ArchiveIcon },
    { key: "logoGranted", label: "Logo granted", icon: ImageIcon },
  ]);
}

export function EventStatsCards({ stats }: { stats: EventListStats }) {
  return cardsFrom(stats, [
    { key: "total", label: "Total", icon: InboxIcon },
    { key: "published", label: "Published", icon: BadgeCheckIcon },
    { key: "draft", label: "Draft", icon: FilePenIcon, accent: true },
    { key: "upcoming", label: "Upcoming", icon: CalendarClockIcon },
  ]);
}

export function CohortStatsCards({ stats }: { stats: CohortListStats }) {
  return cardsFrom(stats, [
    { key: "total", label: "Total", icon: LayersIcon },
    { key: "published", label: "Published", icon: BadgeCheckIcon },
    { key: "draft", label: "Draft", icon: FilePenIcon },
    { key: "open", label: "Programme open", icon: LinkIcon, accent: true },
  ]);
}

export function StartupStatsCards({ stats }: { stats: StartupListStats }) {
  return cardsFrom(stats, [
    { key: "total", label: "Total", icon: InboxIcon },
    { key: "active", label: "Active", icon: SparklesIcon },
    { key: "draft", label: "Draft", icon: FilePenIcon, accent: true },
    { key: "inactive", label: "Inactive", icon: PauseCircleIcon },
  ]);
}

export function EvidenceStatsCards({ stats }: { stats: EvidenceListStats }) {
  return cardsFrom(stats, [
    { key: "total", label: "Total", icon: ShieldAlertIcon },
    { key: "verified", label: "Verified", icon: BadgeCheckIcon },
    { key: "pending", label: "Pending", icon: ClockIcon },
    { key: "attention", label: "Needs attention", icon: CircleDashedIcon, accent: true },
  ]);
}

export function ImpactMetricStatsCards({
  stats,
}: {
  stats: ImpactMetricListStats;
}) {
  return cardsFrom(stats, [
    { key: "total", label: "Total", icon: InboxIcon },
    { key: "verified", label: "Verified", icon: BadgeCheckIcon },
    { key: "pending", label: "Pending", icon: ClockIcon, accent: true },
    { key: "notForPublication", label: "Not for publication", icon: ArchiveIcon },
  ]);
}

export function FounderStoryStatsCards({
  stats,
}: {
  stats: FounderStoryListStats;
}) {
  return cardsFrom(stats, [
    { key: "total", label: "Total", icon: BookOpenIcon },
    { key: "published", label: "Published", icon: BadgeCheckIcon },
    { key: "draft", label: "Draft", icon: FilePenIcon },
    { key: "quotePending", label: "Quote pending", icon: QuoteIcon, accent: true },
  ]);
}
