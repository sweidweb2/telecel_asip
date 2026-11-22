"use client";

import { useCallback, useEffect, useRef } from "react";
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

  const markIfUnread = useCallback(() => {
    if (inboxStatus !== "unread") return;
    if (markedRef.current === id) return;
    markedRef.current = id;

    void updateAction({
      id,
      inboxStatus: "reviewed",
      onlyIfStatus: "unread",
    }).then((result) => {
      if (result.status === "success") {
        router.refresh();
      }
    });
  }, [id, inboxStatus, updateAction, router]);

  useEffect(() => {
    if (isOpen) markIfUnread();
  }, [isOpen, markIfUnread]);

  function onViewOpenChange(open: boolean) {
    if (open) markIfUnread();
  }

  return { onViewOpenChange };
}
