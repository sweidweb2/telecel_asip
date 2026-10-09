"use client";

import type { ReactNode } from "react";

import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { AdminRowEditLink } from "@/components/dashboard/admin-row-edit-link";
import type { AdminActionResult } from "@/types/admin-action";

type AdminEditDeleteActionsProps = {
  editHref: string;
  /** Accessible name, including the record, for example "Edit North Cohort". */
  editLabel: string;
  deleteAction: () => Promise<AdminActionResult>;
  fallbackError: string;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  triggerLabel: string;
};

/** Ghost edit link and delete dialog for a catalogue table row. */
export function AdminEditDeleteActions({
  editHref,
  editLabel,
  deleteAction,
  fallbackError,
  title,
  description,
  confirmLabel,
  triggerLabel,
}: AdminEditDeleteActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <AdminRowEditLink href={editHref} label={editLabel} />
      <AdminRowDelete
        deleteAction={deleteAction}
        fallbackError={fallbackError}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        triggerLabel={triggerLabel}
      />
    </div>
  );
}
