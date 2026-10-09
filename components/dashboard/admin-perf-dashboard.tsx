"use client";

import dynamic from "next/dynamic";
import { GaugeIcon, LayersIcon, TimerIcon } from "lucide-react";

import { AdminPerfEventsTable } from "@/components/dashboard/admin-perf-events-table";
import { AdminSectionHeading } from "@/components/dashboard/admin-section-heading";
import { AdminStatsCards } from "@/components/dashboard/admin-stats-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AdminPerfAnalytics,
  AdminPerfEventRow,
} from "@/data/admin-perf-events";
import type { AdminPerfListQuery } from "@/validations/admin-perf-events";

const AdminPerfCharts = dynamic(
  () =>
    import("@/components/dashboard/admin-perf-charts").then(
      (mod) => mod.AdminPerfCharts,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        className="grid min-h-72 gap-3 rounded-xl border bg-brand-soft lg:grid-cols-2"
        aria-hidden
      />
    ),
  },
);

type Props = {
  events: AdminPerfEventRow[];
  total: number;
  totalPages: number;
  query: AdminPerfListQuery;
  analytics: AdminPerfAnalytics;
  trackingEnabled: boolean;
  siblingsByRequestId: Record<string, AdminPerfEventRow[]>;
};

export function AdminPerfDashboard({
  events,
  total,
  totalPages,
  query,
  analytics,
  trackingEnabled,
  siblingsByRequestId,
}: Props) {
  if (!trackingEnabled) {
    return (
      <Card size="sm">
        <CardHeader className="border-b bg-brand-soft">
          <CardTitle>Tracking is off</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Set <code className="rounded bg-muted px-1">ADMIN_PERF_TRACKING=true</code>{" "}
          in the server environment, restart, then use the CMS normally. Events
          will appear here. This page never instruments its own reads.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-8">
      <AdminStatsCards
        items={[
          {
            key: "events",
            label: "Events (window)",
            value: analytics.total,
            icon: TimerIcon,
          },
          {
            key: "hit",
            label: "Cache hit ratio",
            value: `${Math.round(analytics.hitRatio * 100)}%`,
            icon: GaugeIcon,
          },
          {
            key: "types",
            label: "Event types",
            value: analytics.byEventType.length,
            icon: LayersIcon,
          },
        ]}
      />

      <AdminPerfCharts analytics={analytics} />

      <section className="grid min-w-0 gap-3">
        <AdminSectionHeading>Recent events</AdminSectionHeading>
        <AdminPerfEventsTable
          events={events}
          total={total}
          totalPages={totalPages}
          query={query}
          siblingsByRequestId={siblingsByRequestId}
        />
      </section>
    </div>
  );
}

