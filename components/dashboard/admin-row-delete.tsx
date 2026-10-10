"use client";

import type { ReactNode } from "react";

import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { useAdminDeleteAction } from "@/hooks/use-admin-delete-action";
import type { AdminActionResult } from "@/types/admin-action";

type AdminRowDeleteProps = {
  deleteAction: () => Promise<AdminActionResult>;
  redirectTo?: string;
  fallbackError: string;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  triggerLabel: string;
};

/**
 * Delete trigger + dialog wired to `useAdminDeleteAction`.
 * Used by `AdminEditDeleteActions` for catalogue rows.
 */
export function AdminRowDelete({
  deleteAction,
  redirectTo,
  fallbackError,
  title,
  description,
  confirmLabel,
  triggerLabel,
}: AdminRowDeleteProps) {
  const { deleteOpen, setDeleteOpen, isDeleting, onDelete } =
    useAdminDeleteAction({
      deleteAction,
      redirectTo,
      fallbackError,
    });

  return (
    <AdminDeleteDialog
      open={deleteOpen}
      onOpenChange={setDeleteOpen}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      triggerLabel={triggerLabel}
      isPending={isDeleting}
      onConfirm={onDelete}
    />
  );
}
