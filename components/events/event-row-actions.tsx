"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { deleteEvent } from "@/actions/events";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { Button } from "@/components/ui/button";
import { eventDetailPath, ROUTES } from "@/constants/routes";
import type { EventDetail, EventListItem, EventStartupOption } from "@/types/event";

type EventRowActionsProps = {
  event: EventListItem | EventDetail;
  /** When set with an EventDetail, enables inline edit. List rows omit this. */
  startupOptions?: EventStartupOption[];
  redirectOnDelete?: boolean;
};

function isEventDetail(
  event: EventListItem | EventDetail,
): event is EventDetail {
  return "startup_ids" in event;
}

export function EventRowActions({
  event,
  startupOptions,
  redirectOnDelete = false,
}: EventRowActionsProps) {
  const canInlineEdit = Boolean(startupOptions) && isEventDetail(event);

  return (
    <div className="flex items-center justify-end gap-0.5">
      {canInlineEdit ? (
        <EventFormDialog
          mode="edit"
          event={event}
          startupOptions={startupOptions}
          triggerRender={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${event.name}`}
            />
          }
          triggerContent={<PencilIcon />}
        />
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${event.name}`}
          nativeButton={false}
          render={<Link href={eventDetailPath(event.id)} />}
        >
          <PencilIcon />
        </Button>
      )}

      <AdminRowDelete
        deleteAction={() => deleteEvent({ id: event.id })}
        redirectTo={redirectOnDelete ? ROUTES.events : undefined}
        fallbackError="The event could not be deleted. Please try again."
        title="Delete event?"
        description={
          <>
            This permanently deletes {event.name} and removes its startup links.
            This cannot be undone.
          </>
        }
        confirmLabel="Delete event"
        triggerLabel={`Delete ${event.name}`}
      />
    </div>
  );
}
