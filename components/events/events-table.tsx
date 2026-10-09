"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { CalendarIcon } from "lucide-react";

import { AdminClickableRow } from "@/components/dashboard/admin-clickable-row";
import {
  AdminDataTable,
  CMS_HEAD_ROW_CLASS,
} from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { EventRowActions } from "@/components/events/event-row-actions";
import { EventsFilters } from "@/components/events/events-filters";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { eventDetailPath, ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { EventListItem } from "@/types/event";
import {
  CMS_PUBLISH_STATUS_LABELS,
  EVENT_FORMAT_LABELS,
  EVENT_PAGE_SIZE,
  type EventListQuery,
} from "@/validations/event";

export function EventsTable({
  events,
  total,
  totalPages,
  query,
}: {
  events: EventListItem[];
  total: number;
  totalPages: number;
  query: EventListQuery;
}) {
  const router = useRouter();
  const listFilters = {
    search: query.search,
    status: query.status === "all" ? undefined : query.status,
  };
  const isFiltered = adminListFiltersActive(listFilters);

  return (
    <AdminDataTable
      filters={<EventsFilters query={query} />}
      header={
        <TableRow className={CMS_HEAD_ROW_CLASS}>
          <AdminRowNumberHead />
          <TableHead>Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Format</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={events.length === 0}
      emptyColSpan={7}
      empty={
        <AdminEmptyState
          icon={CalendarIcon}
          isFiltered={isFiltered}
          emptyTitle="No events yet"
          emptyDescription="Create the first event to publish on the site."
          noResultsTitle="No events found"
          noResultsDescription="Try changing the filters or clearing search."
          createHref={ROUTES.eventsNew}
          createLabel="New event"
        />
      }
      pagination={{
        basePath: ROUTES.events,
        page: query.page,
        pageSize: EVENT_PAGE_SIZE,
        total,
        totalPages,
        filters: listFilters,
      }}
    >
      {events.map((event, index) => (
        <AdminClickableRow
          key={event.id}
          ariaLabel={`Edit event ${event.name}`}
          onActivate={() => router.push(eventDetailPath(event.id))}
        >
          <AdminRowNumberCell
            page={query.page}
            pageSize={EVENT_PAGE_SIZE}
            index={index}
          />
          <TableCell className="max-w-[12rem] font-medium sm:max-w-[18rem]">
            <Link
              href={eventDetailPath(event.id)}
              title={event.name}
              className="block truncate hover:underline"
              onClick={(clickEvent) => clickEvent.stopPropagation()}
            >
              {event.name}
            </Link>
          </TableCell>
          <TableCell className="whitespace-nowrap">
            {formatAdminDate(event.event_date)}
          </TableCell>
          <TableCell className="whitespace-nowrap">
            {event.format ? EVENT_FORMAT_LABELS[event.format] : "-"}
          </TableCell>
          <TableCell className="max-w-[10rem] text-muted-foreground sm:max-w-[14rem]">
            <span
              className="block truncate"
              title={event.location ?? undefined}
            >
              {event.location || "-"}
            </span>
          </TableCell>
          <TableCell className="whitespace-nowrap">
            <Badge
              variant={
                event.publish_status === "published" ? "default" : "outline"
              }
            >
              {CMS_PUBLISH_STATUS_LABELS[event.publish_status]}
            </Badge>
          </TableCell>
          <TableCell
            className="pr-4 whitespace-nowrap"
            onClick={(clickEvent) => clickEvent.stopPropagation()}
          >
            <EventRowActions event={event} />
          </TableCell>
        </AdminClickableRow>
      ))}
    </AdminDataTable>
  );
}
