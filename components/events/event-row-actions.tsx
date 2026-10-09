"use client";

import { deleteEvent } from "@/actions/events";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { AdminRowEditLink } from "@/components/dashboard/admin-row-edit-link";
import { eventDetailPath, ROUTES } from "@/constants/routes";
import type { EventListItem } from "@/types/event";

type EventRowActionsProps = {
  event: EventListItem;
  redirectOnDelete?: boolean;
};

export function EventRowActions({
  event,
  redirectOnDelete = false,
}: EventRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <AdminRowEditLink
        href={eventDetailPath(event.id)}
        label={`Edit ${event.name}`}
      />

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
