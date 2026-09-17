"use client";

import { memo } from "react";

import { updateApplicationInboxStatus } from "@/actions/applications";
import { AdminInboxArchiveButton } from "@/components/dashboard/admin-inbox-archive-button";
import { AdminRowActionButtons } from "@/components/dashboard/admin-row-action-buttons";
import type { ApplicationListItem } from "@/types/application";

export const ApplicationRowActions = memo(function ApplicationRowActions({
  application,
  onView,
  onEdit,
  onDelete,
}: {
  application: ApplicationListItem;
  onView: (row: ApplicationListItem) => void;
  onEdit: (row: ApplicationListItem) => void;
  onDelete: (row: ApplicationListItem) => void;
}) {
  return (
    <AdminRowActionButtons
      viewLabel={`View ${application.full_name}`}
      editLabel={`Edit ${application.full_name}`}
      deleteLabel={`Delete ${application.full_name}`}
      onView={() => onView(application)}
      onEdit={() => onEdit(application)}
      onDelete={() => onDelete(application)}
      extra={
        <AdminInboxArchiveButton
          id={application.id}
          inboxStatus={application.inbox_status}
          updateAction={updateApplicationInboxStatus}
        />
      }
    />
  );
});
