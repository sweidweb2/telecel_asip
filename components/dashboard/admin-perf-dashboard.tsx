"use client";

import dynamic from "next/dynamic";

import { AdminPerfEventsTable } from "@/components/dashboard/admin-perf-events-table";
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
        className="grid min-h-72 gap-3 rounded-xl border bg-muted/40 lg:grid-cols-2"
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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tracking is off</CardTitle>
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
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Events (window)" value={String(analytics.total)} />
        <StatCard
          label="Cache hit ratio"
          value={`${Math.round(analytics.hitRatio * 100)}%`}
        />
        <StatCard
          label="Event types"
          value={String(analytics.byEventType.length)}
        />
      </section>

      <AdminPerfCharts analytics={analytics} />

      <section className="grid min-w-0 gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Recent events
        </h2>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
