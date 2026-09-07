"use client";

import { useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react";
import { toast } from "sonner";

import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { Button } from "@/components/ui/button";
import type { InboxStatus } from "@/constants/inbox";
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
  const isArchived = inboxStatus === "archived";
  const label = isArchived ? "Unarchive" : "Archive";

  function toggleArchive() {
    const nextStatus: InboxStatus = isArchived ? "reviewed" : "archived";

    startTransition(async () => {
      try {
        const result = await updateAction({ id, inboxStatus: nextStatus });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(
          nextStatus === "archived" ? "Archived." : "Moved back to inbox.",
        );
        router.refresh();
      } catch {
        toast.error("Could not update inbox status. Please try again.");
      }
    });
  }

  return (
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
  );
}
