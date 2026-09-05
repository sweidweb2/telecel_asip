"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { deleteEvent } from "@/actions/events";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { EventListItem, EventStartupOption } from "@/types/event";

type EventRowActionsProps = {
  event: EventListItem;
  startupOptions: EventStartupOption[];
  redirectOnDelete?: boolean;
};

export function EventRowActions({
  event,
  startupOptions,
  redirectOnDelete = false,
}: EventRowActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  function onDelete() {
    startDelete(async () => {
      try {
        const result = await deleteEvent({ id: event.id });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setDeleteOpen(false);
        if (redirectOnDelete) {
          router.push(ROUTES.events);
          return;
        }
        router.refresh();
      } catch {
        toast.error("The event could not be deleted. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
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

      <AdminDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete event?"
        description={
          <>
            This permanently deletes {event.name} and removes its startup links.
            This cannot be undone.
          </>
        }
        confirmLabel="Delete event"
        triggerLabel={`Delete ${event.name}`}
        isPending={isDeleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
