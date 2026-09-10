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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminPerfAnalytics } from "@/data/admin-perf-events";

type AdminPerfChartsProps = {
  analytics: AdminPerfAnalytics;
};

/**
 * Recharts leaf for the admin performance dashboard (loaded via next/dynamic).
 */
export function AdminPerfCharts({ analytics }: AdminPerfChartsProps) {
  return (
    <>
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
                <XAxis
                  dataKey="name"
                  angle={-35}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 11 }} unit="ms" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="miss"
                  fill="var(--color-chart-1)"
                  name="Miss / n_a avg"
                />
                <Bar
                  dataKey="hit"
                  fill="var(--color-chart-2)"
                  name="Hit avg"
                />
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
              <LineChart
                data={analytics.overTime}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="bucket"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(11, 16)}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="miss"
                  stroke="var(--color-chart-1)"
                  name="Miss / n_a"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="hit"
                  stroke="var(--color-chart-2)"
                  name="Hit"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-chart-3)"
                  name="Total"
                  dot={false}
                />
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
            <BarChart
              data={analytics.byEventType}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="eventType" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="var(--brand)" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
