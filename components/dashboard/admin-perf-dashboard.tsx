"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminPerfEventsTable } from "@/components/dashboard/admin-perf-events-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AdminPerfAnalytics,
  AdminPerfEventRow,
} from "@/data/admin-perf-events";
import type { AdminPerfListQuery } from "@/validations/admin-perf-events";

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

      <section className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Slowest names (hit vs miss)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.slowest.map((s) => ({
                  name: s.name.length > 18 ? `${s.name.slice(0, 16)}…` : s.name,
                  hit: s.hitAvgMs,
                  miss: s.missAvgMs,
                }))}
                margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" angle={-35} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="ms" />
                <Tooltip />
                <Legend />
                <Bar dataKey="miss" fill="var(--color-chart-1, #c2410c)" name="Miss / n_a avg" />
                <Bar dataKey="hit" fill="var(--color-chart-2, #15803d)" name="Hit avg" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Events over time</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.overTime} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="bucket"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(11, 16)}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="miss" stroke="#c2410c" name="Miss / n_a" dot={false} />
                <Line type="monotone" dataKey="hit" stroke="#15803d" name="Hit" dot={false} />
                <Line type="monotone" dataKey="count" stroke="#334155" name="Total" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Count by event type</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.byEventType} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="eventType" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#334155" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
        <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
