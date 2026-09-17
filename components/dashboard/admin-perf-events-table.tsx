"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { TimerIcon } from "lucide-react";

import { AdminClickableRow } from "@/components/dashboard/admin-clickable-row";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import { AdminPerfEventsFilters } from "@/components/dashboard/admin-perf-events-filters";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
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
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
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
  const listFilters = adminPerfListFilterParams(query);
  const isFiltered = adminListFiltersActive({
    search: listFilters.search,
    eventType: listFilters.eventType,
    cacheStatus: listFilters.cacheStatus,
  });

  return (
    <>
      <AdminDataTable
        filters={<AdminPerfEventsFilters query={query} />}
        header={
          <TableRow>
            <AdminRowNumberHead />
            <TableHead>Time</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Cache</TableHead>
            <TableHead className="text-right">ms</TableHead>
            <TableHead className="pr-4">Route</TableHead>
          </TableRow>
        }
        isEmpty={events.length === 0}
        emptyColSpan={7}
        empty={
          <AdminEmptyState
            icon={TimerIcon}
            isFiltered={isFiltered}
            emptyTitle="No performance events yet"
            emptyDescription="Use the CMS with tracking on to collect events."
            noResultsTitle="No events found"
            noResultsDescription="Try changing the filters or clearing search."
          />
        }
        pagination={{
          basePath: ROUTES.performance,
          page: query.page,
          pageSize: query.pageSize,
          total,
          totalPages,
          filters: listFilters,
          pageSizeOptions: ADMIN_PERF_PAGE_SIZES,
          defaultPageSize: ADMIN_PERF_DEFAULT_PAGE_SIZE,
        }}
      >
        {events.map((event, index) => (
          <AdminClickableRow
            key={event.id}
            ariaLabel={`View performance event ${event.name}`}
            onActivate={() => setSelected(event)}
          >
            <AdminRowNumberCell
              page={query.page}
              pageSize={query.pageSize}
              index={index}
            />
            <TableCell className="whitespace-nowrap tabular-nums">
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
              {event.route ?? "-"}
            </TableCell>
          </AdminClickableRow>
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
                  <dd className="break-all">{selected.route ?? "-"}</dd>
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

const CACHE_BADGE_LABELS: Record<string, string> = {
  hit: "Hit",
  miss: "Miss",
  n_a: "N/A",
  bypass: "Bypass",
};

function CacheBadge({ status }: { status: string }) {
  const label = CACHE_BADGE_LABELS[status] ?? status;
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-1.5 py-0.5 text-xs font-medium",
        status === "hit" && "bg-brand-soft text-foreground",
        status === "miss" && "bg-destructive/15 text-destructive",
        status === "n_a" && "bg-muted text-muted-foreground",
        status === "bypass" && "bg-brand-subtle text-foreground",
      )}
    >
      {label}
    </span>
  );
}
