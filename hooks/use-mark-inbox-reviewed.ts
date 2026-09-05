"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "nextjs-toploader/app";

import type { InboxStatus } from "@/constants/inbox";
import type { AdminActionResult } from "@/types/admin-action";
import type { UpdateInboxStatusInput } from "@/validations/inbox";

type UpdateInboxStatusAction = (
  input: UpdateInboxStatusInput,
) => Promise<AdminActionResult>;

/**
 * Mark unread → reviewed when a detail dialog opens (silent refresh).
 * Pass `isOpen` for controlled row-click opens (Dialog onOpenChange does not fire).
 */
export function useMarkInboxReviewed({
  id,
  inboxStatus,
  updateAction,
  isOpen,
}: {
  id: string;
  inboxStatus: InboxStatus;
  updateAction: UpdateInboxStatusAction;
  isOpen?: boolean;
}) {
  const router = useRouter();
  const markedRef = useRef<string | null>(null);

  function markIfUnread() {
    if (inboxStatus !== "unread") return;
    if (markedRef.current === id) return;
    markedRef.current = id;

    void updateAction({ id, inboxStatus: "reviewed" }).then((result) => {
      if (result.status === "success") {
        router.refresh();
      }
    });
  }

  useEffect(() => {
    if (isOpen) markIfUnread();
  }, [isOpen, id, inboxStatus, updateAction]);

  function onViewOpenChange(open: boolean) {
    if (open) markIfUnread();
  }

  return { onViewOpenChange };
}
