"use client";

import { Loader2Icon, Trash2Icon } from "lucide-react";

import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AdminDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  pendingLabel?: string;
  isPending: boolean;
  onConfirm: () => void;
  /** Accessible name for the destructive trigger icon button. */
  triggerLabel?: string;
  /** When omitted, open the dialog from an external control via `onOpenChange`. */
  showTrigger?: boolean;
};

export function AdminDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel = "Deleting…",
  isPending,
  onConfirm,
  triggerLabel,
  showTrigger = true,
}: AdminDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {showTrigger ? (
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                ADMIN_ICON_BUTTON_CLASS,
                "text-destructive hover:bg-destructive/10 hover:text-destructive",
              )}
              aria-label={triggerLabel ?? confirmLabel}
            />
          }
        >
          <Trash2Icon />
        </AlertDialogTrigger>
      ) : null}
      <AlertDialogContent>
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <Trash2Icon />
            )}
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
