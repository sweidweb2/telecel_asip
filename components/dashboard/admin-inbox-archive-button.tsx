"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react";
import { toast } from "sonner";

import { AdminActionTooltip } from "@/components/dashboard/admin-action-tooltip";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { Button } from "@/components/ui/button";
import type { InboxStatus } from "@/constants/inbox";
import { toastWithUndo } from "@/lib/toast-with-undo";
import type { AdminActionResult } from "@/types/admin-action";
import type { UpdateInboxStatusInput } from "@/validations/inbox";

type UpdateInboxStatusAction = (
  input: UpdateInboxStatusInput,
) => Promise<AdminActionResult>;

export function AdminInboxArchiveButton({
  id,
  inboxStatus,
  updateAction,
}: {
  id: string;
  inboxStatus: InboxStatus;
  updateAction: UpdateInboxStatusAction;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(inboxStatus);
  const [prevInboxStatus, setPrevInboxStatus] = useState(inboxStatus);

  if (inboxStatus !== prevInboxStatus) {
    setPrevInboxStatus(inboxStatus);
    setStatus(inboxStatus);
  }

  const isArchived = status === "archived";
  const label = isArchived ? "Unarchive" : "Archive";

  function toggleArchive() {
    if (isPending) return;

    const previousStatus = status;
    const nextStatus: InboxStatus = isArchived ? "reviewed" : "archived";
    setStatus(nextStatus);

    startTransition(async () => {
      try {
        const result = await updateAction({ id, inboxStatus: nextStatus });
        if (result.status === "error") {
          setStatus(previousStatus);
          toast.error(result.message);
          return;
        }
        toastWithUndo({
          message:
            nextStatus === "archived" ? "Archived." : "Moved back to inbox.",
          onUndo: async () => {
            setStatus(previousStatus);
            const undoResult = await updateAction({
              id,
              inboxStatus: previousStatus,
            });
            if (undoResult.status === "error") {
              setStatus(nextStatus);
              throw new Error(undoResult.message);
            }
            router.refresh();
          },
        });
        router.refresh();
      } catch {
        setStatus(previousStatus);
        toast.error("Could not update inbox status. Please try again.");
      }
    });
  }

  return (
    <AdminActionTooltip label={label}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={ADMIN_ICON_BUTTON_CLASS}
        aria-label={label}
        disabled={isPending}
        onClick={toggleArchive}
      >
        {isArchived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
      </Button>
    </AdminActionTooltip>
  );
}
