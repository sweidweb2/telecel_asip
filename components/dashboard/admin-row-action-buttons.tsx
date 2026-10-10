"use client";

import { memo, type ComponentProps, type ReactNode } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { AdminActionTooltip } from "@/components/dashboard/admin-action-tooltip";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

function ActionIconButton({
  tooltip,
  disabled = false,
  className,
  children,
  ...props
}: {
  tooltip: string;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Button>, "children" | "className">) {
  const button = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      className={cn(ADMIN_ICON_BUTTON_CLASS, className)}
      {...props}
    >
      {children}
    </Button>
  );

  if (disabled) {
    return (
      <Tooltip disableHoverablePopup>
        <TooltipTrigger
          delay={0}
          closeDelay={0}
          render={<span className="inline-flex" />}
        >
          {button}
        </TooltipTrigger>
        <TooltipContent side="top">{tooltip}</TooltipContent>
      </Tooltip>
    );
  }

  return <AdminActionTooltip label={tooltip}>{button}</AdminActionTooltip>;
}

/**
 * Icon buttons only — dialogs live once at the table, not on every row.
 * Each icon shows a tooltip for that action alone.
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
      <ActionIconButton tooltip="View" aria-label={viewLabel} onClick={onView}>
        <EyeIcon />
      </ActionIconButton>
      {extra}
      {onEdit && canEdit ? (
        <ActionIconButton tooltip="Edit" aria-label={editLabel} onClick={onEdit}>
          <PencilIcon />
        </ActionIconButton>
      ) : null}
      {onDelete ? (
        <ActionIconButton
          tooltip="Delete"
          aria-label={deleteLabel}
          disabled={!canDelete}
          onClick={onDelete}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2Icon />
        </ActionIconButton>
      ) : null}
    </div>
  );
});
