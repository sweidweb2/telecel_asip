"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { TimerIcon } from "lucide-react";

import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import { AdminPerfEventsFilters } from "@/components/dashboard/admin-perf-events-filters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import type { AdminPerfEventRow } from "@/data/admin-perf-events";
import { cn } from "@/lib/utils";
import {
  ADMIN_PERF_DEFAULT_PAGE_SIZE,
  ADMIN_PERF_PAGE_SIZES,
  adminPerfListFilterParams,
  type AdminPerfListQuery,
} from "@/validations/admin-perf-events";

export function AdminPerfEventsTable({
  events,
  total,
  totalPages,
  query,
  siblingsByRequestId,
}: {
  events: AdminPerfEventRow[];
  total: number;
  totalPages: number;
  query: AdminPerfListQuery;
  siblingsByRequestId: Record<string, AdminPerfEventRow[]>;
}) {
  const [selected, setSelected] = useState<AdminPerfEventRow | null>(null);
  const siblings = selected
    ? (siblingsByRequestId[selected.request_id] ?? [selected])
    : [];

  return (
    <>
      <AdminDataTable
        filters={<AdminPerfEventsFilters query={query} />}
        header={
          <TableRow>
            <TableHead className="pl-4">Time</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Cache</TableHead>
            <TableHead className="text-right">ms</TableHead>
            <TableHead className="pr-4">Route</TableHead>
          </TableRow>
        }
        isEmpty={events.length === 0}
        emptyColSpan={6}
        empty={
          <AdminEmptyState
            icon={TimerIcon}
            title="No events found"
            description="Try changing the search or filters, or use the CMS with tracking on."
          />
        }
        pagination={{
          basePath: ROUTES.performance,
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages,
          filters: adminPerfListFilterParams(query),
          pageSizeOptions: ADMIN_PERF_PAGE_SIZES,
          defaultPageSize: ADMIN_PERF_DEFAULT_PAGE_SIZE,
        }}
      >
        {events.map((event) => (
          <TableRow
            key={event.id}
            className="cursor-pointer"
            onClick={() => setSelected(event)}
          >
            <TableCell className="whitespace-nowrap pl-4 tabular-nums">
              {format(parseISO(event.created_at), "MMM d, HH:mm:ss.SSS")}
            </TableCell>
            <TableCell className="max-w-[14rem] truncate font-medium">
              {event.name}
            </TableCell>
            <TableCell>{event.event_type}</TableCell>
            <TableCell>
              <CacheBadge status={event.cache_status} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {event.duration_ms.toFixed(1)}
            </TableCell>
            <TableCell className="max-w-[10rem] truncate pr-4 text-muted-foreground">
              {event.route ?? "—"}
            </TableCell>
          </TableRow>
        ))}
      </AdminDataTable>

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
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="tabular-nums">
                    {selected.duration_ms.toFixed(2)} ms
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">OK</dt>
                  <dd>{selected.ok ? "yes" : "no"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-muted-foreground">Route</dt>
                  <dd className="break-all">{selected.route ?? "—"}</dd>
                </div>
                {selected.error_message ? (
                  <div className="sm:col-span-2">
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
                  {siblings.map((sibling) => (
                    <li
                      key={sibling.id}
                      className={cn(
                        "flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2",
                        sibling.id === selected.id &&
                          "border-foreground/40 bg-muted/50",
                      )}
                    >
                      <span className="min-w-0 truncate font-medium">
                        {sibling.name}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CacheBadge status={sibling.cache_status} />
                        <span className="tabular-nums">
                          {sibling.duration_ms.toFixed(1)} ms
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
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
