"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { EventRowActions } from "@/components/events/event-row-actions";
import { EventsFilters } from "@/components/events/events-filters";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { eventDetailPath, ROUTES } from "@/constants/routes";
import type { EventListItem } from "@/types/event";
import {
  CMS_PUBLISH_STATUS_LABELS,
  EVENT_FORMAT_LABELS,
  EVENT_PAGE_SIZE,
  type EventListQuery,
} from "@/validations/event";

function formatEventDate(value: string) {
  try {
    return format(parseISO(value), "d MMM yyyy");
  } catch {
    return value;
  }
}

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

  return (
    <AdminDataTable
      filters={<EventsFilters query={query} />}
      header={
        <TableRow>
          <TableHead className="pl-4">Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Format</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={events.length === 0}
      emptyColSpan={6}
      empty={
        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 whitespace-normal">
          <span className="flex size-10 items-center justify-center rounded-full bg-muted">
            <CalendarIcon className="size-5 text-muted-foreground" />
          </span>
          <p className="font-medium">No events found</p>
          <p className="text-sm text-muted-foreground">
            Try changing the filters, or create a new event.
          </p>
        </div>
      }
      pagination={{
        basePath: ROUTES.events,
        page: query.page,
        pageSize: EVENT_PAGE_SIZE,
        total,
        totalPages,
        filters: {
          search: query.search,
          status: query.status === "all" ? undefined : query.status,
        },
      }}
    >
      {events.map((event) => (
        <TableRow
          key={event.id}
          className="cursor-pointer"
          onClick={() => router.push(eventDetailPath(event.id))}
        >
          <TableCell className="max-w-[12rem] pl-4 font-medium sm:max-w-[18rem]">
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
            {formatEventDate(event.event_date)}
          </TableCell>
          <TableCell className="whitespace-nowrap">
            {event.format ? EVENT_FORMAT_LABELS[event.format] : "—"}
          </TableCell>
          <TableCell className="max-w-[10rem] text-muted-foreground sm:max-w-[14rem]">
            <span
              className="block truncate"
              title={event.location ?? undefined}
            >
              {event.location || "—"}
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
        </TableRow>
      ))}
    </AdminDataTable>
  );
}
