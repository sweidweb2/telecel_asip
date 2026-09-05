"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { EventRowActions } from "@/components/events/event-row-actions";
import { EventsFilters } from "@/components/events/events-filters";
import { AdminPagination } from "@/components/dashboard/admin-pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { eventDetailPath, ROUTES } from "@/constants/routes";
import type { EventListItem, EventStartupOption } from "@/types/event";
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
  startupOptions,
}: {
  events: EventListItem[];
  total: number;
  totalPages: number;
  query: EventListQuery;
  startupOptions: EventStartupOption[];
}) {
  const router = useRouter();

  return (
    <Card className="min-w-0 gap-0 overflow-hidden py-0">
      <EventsFilters query={query} />

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 whitespace-normal">
                      <span className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <CalendarIcon className="size-5 text-muted-foreground" />
                      </span>
                      <p className="font-medium">No events found</p>
                      <p className="text-sm text-muted-foreground">
                        Try changing the filters, or create a new event.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
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
                      {event.format
                        ? EVENT_FORMAT_LABELS[event.format]
                        : "—"}
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
                          event.publish_status === "published"
                            ? "default"
                            : "outline"
                        }
                      >
                        {CMS_PUBLISH_STATUS_LABELS[event.publish_status]}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="pr-4 whitespace-nowrap"
                      onClick={(clickEvent) => clickEvent.stopPropagation()}
                    >
                      <EventRowActions
                        event={event}
                        startupOptions={startupOptions}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-transparent px-4 py-3">
        <AdminPagination
          basePath={ROUTES.events}
          page={query.page}
          pageSize={EVENT_PAGE_SIZE}
          total={total}
          totalPages={totalPages}
          filters={{
            search: query.search,
            status: query.status === "all" ? undefined : query.status,
          }}
        />
      </CardFooter>
    </Card>
  );
}
