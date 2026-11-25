"use client";

import type { InboxStatus } from "@/constants/inbox";
import {
  useEditorRecord,
  type EditorRecordLoadResult,
} from "@/hooks/use-editor-record";
import { useMarkInboxReviewed } from "@/hooks/use-mark-inbox-reviewed";
import type { AdminActionResult } from "@/types/admin-action";
import type { UpdateInboxStatusInput } from "@/validations/inbox";

type UpdateInboxStatusAction = (
  input: UpdateInboxStatusInput,
) => Promise<AdminActionResult>;

/**
 * Load + auto-mark-reviewed for an inbox view dialog.
 */
export function useInboxViewDialog<T>({
  open,
  id,
  inboxStatus,
  load,
  updateAction,
  missingMessage,
}: {
  open: boolean;
  id: string | undefined;
  inboxStatus: InboxStatus | undefined;
  load: (id: string) => Promise<EditorRecordLoadResult<T>>;
  updateAction: UpdateInboxStatusAction;
  missingMessage: string;
}) {
  const { record, isLoading } = useEditorRecord({
    open,
    id,
    load,
    missingMessage,
  });
  useMarkInboxReviewed({
    id: id ?? "",
    inboxStatus: inboxStatus ?? "reviewed",
    updateAction,
    isOpen: open && Boolean(id),
  });

  return { record, isLoading };
}
