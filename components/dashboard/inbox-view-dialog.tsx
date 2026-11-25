"use client";

import type { ReactNode } from "react";

import { ADMIN_INBOX_VIEW_DIALOG_CLASS } from "@/components/dashboard/admin-detail-row";
import { InboxDialogLoading } from "@/components/dashboard/inbox-dialog-loading";
import { InboxStatusBadge } from "@/components/dashboard/inbox-status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { InboxStatus } from "@/constants/inbox";

/**
 * Shared shell for inbox eye-view dialogs: title, status badge, loading, footer.
 * Pass entity-specific detail sections as children when a record is loaded.
 */
export function InboxViewDialogShell({
  open,
  onOpenChange,
  title,
  description,
  status,
  hasRecord,
  isLoading,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  status?: InboxStatus;
  hasRecord: boolean;
  isLoading: boolean;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={ADMIN_INBOX_VIEW_DIALOG_CLASS}>
        <DialogHeader className="min-w-0 gap-3">
          <div className="flex flex-wrap items-start gap-2 pr-8">
            <DialogTitle className="min-w-0 flex-1 wrap-break-word [overflow-wrap:anywhere]">
              {title}
            </DialogTitle>
            {status ? <InboxStatusBadge status={status} /> : null}
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {hasRecord ? (
          <div className="grid min-w-0 gap-6">{children}</div>
        ) : isLoading ? (
          <InboxDialogLoading />
        ) : null}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
