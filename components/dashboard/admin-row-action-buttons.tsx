"use client";

import { memo, type ReactNode } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminRowActionButtonsProps = {
  viewLabel: string;
  editLabel?: string;
  deleteLabel?: string;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  extra?: ReactNode;
};

/**
 * Icon buttons only — dialogs live once at the table, not on every row.
 */
export const AdminRowActionButtons = memo(function AdminRowActionButtons({
  viewLabel,
  editLabel,
  deleteLabel,
  onView,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
  extra,
}: AdminRowActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={ADMIN_ICON_BUTTON_CLASS}
        aria-label={viewLabel}
        onClick={onView}
      >
        <EyeIcon />
      </Button>
      {extra}
      {onEdit && canEdit ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={ADMIN_ICON_BUTTON_CLASS}
          aria-label={editLabel}
          onClick={onEdit}
        >
          <PencilIcon />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            ADMIN_ICON_BUTTON_CLASS,
            "text-destructive hover:bg-destructive/10 hover:text-destructive",
          )}
          aria-label={deleteLabel}
          disabled={!canDelete}
          onClick={onDelete}
        >
          <Trash2Icon />
        </Button>
      ) : null}
    </div>
  );
});
