"use client";

import { useMemo, useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
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

import { deleteOldAdminPerfEvents } from "@/actions/admin-perf-events";
import type {
  AdminPerfAnalytics,
  AdminPerfEventRow,
} from "@/data/admin-perf-events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Props = {
  events: AdminPerfEventRow[];
  analytics: AdminPerfAnalytics;
  trackingEnabled: boolean;
  siblingsByRequestId: Record<string, AdminPerfEventRow[]>;
};

export function AdminPerfDashboard({
  events,
  analytics,
  trackingEnabled,
  siblingsByRequestId,
}: Props) {
  const [eventType, setEventType] = useState("all");
  const [cacheStatus, setCacheStatus] = useState("all");
  const [nameSearch, setNameSearch] = useState("");
  const [selected, setSelected] = useState<AdminPerfEventRow | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = nameSearch.trim().toLowerCase();
    return events.filter((e) => {
      if (eventType !== "all" && e.event_type !== eventType) return false;
      if (cacheStatus !== "all" && e.cache_status !== cacheStatus) return false;
      if (q && !e.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [events, eventType, cacheStatus, nameSearch]);

  const siblings = selected
    ? (siblingsByRequestId[selected.request_id] ?? [selected])
    : [];

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
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Events (window)" value={String(analytics.total)} />
        <StatCard
          label="Cache hit ratio"
          value={`${Math.round(analytics.hitRatio * 100)}%`}
        />
        <StatCard
          label="Event types"
          value={String(analytics.byEventType.length)}
        />
        <div className="flex items-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 w-full"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await deleteOldAdminPerfEvents();
                if (result.status === "error") {
                  toast.error(result.message);
                  return;
                }
                toast.success(result.message);
              });
            }}
          >
            Delete events older than 7 days
          </Button>
        </div>
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

      <section className="grid gap-3 lg:grid-cols-2">
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Event type</span>
              <select
                className="min-h-11 w-full rounded-lg border border-input bg-background px-3"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="all">All</option>
                {[
                  "layout",
                  "page",
                  "action",
                  "data_read",
                  "option_load",
                  "mutation",
                  "upload",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Cache</span>
              <select
                className="min-h-11 w-full rounded-lg border border-input bg-background px-3"
                value={cacheStatus}
                onChange={(e) => setCacheStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="hit">hit</option>
                <option value="miss">miss</option>
                <option value="bypass">bypass</option>
                <option value="n_a">n_a</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm sm:col-span-1">
              <span className="text-muted-foreground">Name</span>
              <Input
                className="min-h-11"
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                placeholder="Search name…"
              />
            </label>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Recent events
        </h2>
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cache</TableHead>
                <TableHead className="text-right">ms</TableHead>
                <TableHead>Route</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No events in this window. Navigate CMS lists, open a detail,
                    save a form, or upload an image with tracking on.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow
                    key={e.id}
                    className="cursor-pointer"
                    onClick={() => setSelected(e)}
                  >
                    <TableCell className="whitespace-nowrap tabular-nums">
                      {format(parseISO(e.created_at), "HH:mm:ss.SSS")}
                    </TableCell>
                    <TableCell className="max-w-[14rem] truncate font-medium">
                      {e.name}
                    </TableCell>
                    <TableCell>{e.event_type}</TableCell>
                    <TableCell>
                      <CacheBadge status={e.cache_status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {e.duration_ms.toFixed(1)}
                    </TableCell>
                    <TableCell className="max-w-[10rem] truncate text-muted-foreground">
                      {e.route ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              Request {selected?.request_id} · {selected?.event_type} ·{" "}
              {selected?.cache_status}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="grid gap-4 text-sm">
              <dl className="grid grid-cols-2 gap-2">
                <div>
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="tabular-nums">{selected.duration_ms.toFixed(2)} ms</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">OK</dt>
                  <dd>{selected.ok ? "yes" : "no"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Route</dt>
                  <dd className="break-all">{selected.route ?? "—"}</dd>
                </div>
                {selected.error_message ? (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Error</dt>
                    <dd className="break-all text-destructive">
                      {selected.error_message}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <div>
                <p className="mb-1 text-muted-foreground">meta</p>
                <pre className="max-h-40 overflow-auto rounded-lg bg-muted p-3 text-xs">
                  {JSON.stringify(selected.meta, null, 2)}
                </pre>
              </div>
              <div>
                <p className="mb-2 font-medium">Request waterfall</p>
                <ul className="grid gap-1">
                  {siblings.map((s) => (
                    <li
                      key={s.id}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2",
                        s.id === selected.id && "border-foreground/40 bg-muted/50",
                      )}
                    >
                      <span className="min-w-0 truncate font-medium">{s.name}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CacheBadge status={s.cache_status} />
                        <span className="tabular-nums">{s.duration_ms.toFixed(1)} ms</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
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

function CacheBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium",
        status === "hit" && "bg-emerald-100 text-emerald-800",
        status === "miss" && "bg-orange-100 text-orange-900",
        status === "n_a" && "bg-slate-100 text-slate-700",
        status === "bypass" && "bg-amber-100 text-amber-900",
      )}
    >
      {status}
    </span>
  );
}
