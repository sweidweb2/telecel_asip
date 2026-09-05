import { format, parseISO } from "date-fns";
import {
  CalendarIcon,
  LinkIcon,
  MapPinIcon,
  MicIcon,
  MonitorIcon,
} from "lucide-react";

import { EventRowActions } from "@/components/events/event-row-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { EventDetail, EventStartupOption } from "@/types/event";
import {
  CMS_PUBLISH_STATUS_LABELS,
  EVENT_FORMAT_LABELS,
} from "@/validations/event";

function Stat({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof LinkIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-1 text-sm break-words">{children}</dd>
      </div>
    </div>
  );
}

function formatEventDate(value: string) {
  try {
    return format(parseISO(value), "d MMMM yyyy");
  } catch {
    return value;
  }
}

export function EventDetailContent({
  event,
  startupOptions,
}: {
  event: EventDetail;
  startupOptions: EventStartupOption[];
}) {
  const linkedStartups = startupOptions.filter((option) =>
    event.startup_ids.includes(option.id),
  );

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-3">
      <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="line-clamp-2 font-heading text-2xl tracking-tight break-words">
                {event.name}
              </CardTitle>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge
                  variant={
                    event.publish_status === "published" ? "default" : "outline"
                  }
                >
                  {CMS_PUBLISH_STATUS_LABELS[event.publish_status]}
                </Badge>
                {event.format ? (
                  <Badge variant="secondary">
                    {EVENT_FORMAT_LABELS[event.format]}
                  </Badge>
                ) : null}
              </div>
            </div>
            <EventRowActions
              event={event}
              startupOptions={startupOptions}
              redirectOnDelete
            />
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Stat icon={CalendarIcon} label="Date">
              {formatEventDate(event.event_date)}
            </Stat>
            <Stat icon={MapPinIcon} label="Location">
              {event.location || "—"}
            </Stat>
            <Stat icon={MonitorIcon} label="Format">
              {event.format ? EVENT_FORMAT_LABELS[event.format] : "—"}
            </Stat>
            <Stat icon={MicIcon} label="Speakers">
              {event.speakers.length > 0 ? event.speakers.join(", ") : "—"}
            </Stat>
          </CardContent>
        </Card>

        {event.outcomes ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Outcomes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {event.outcomes}
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {event.assets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assets linked.</p>
            ) : (
              event.assets.map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-11 items-center gap-2 break-all text-sm text-primary underline-offset-4 hover:underline sm:min-h-8"
                >
                  <LinkIcon className="size-3.5 shrink-0" />
                  {url}
                </a>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linked startups</CardTitle>
          </CardHeader>
          <CardContent>
            {linkedStartups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No startups linked to this event.
              </p>
            ) : (
              <ul className="space-y-2">
                {linkedStartups.map((startup) => (
                  <li key={startup.id} className="text-sm">
                    {startup.name}
                  </li>
                ))}
              </ul>
            )}
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              Updated{" "}
              {format(parseISO(event.updated_at), "d MMM yyyy HH:mm")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
