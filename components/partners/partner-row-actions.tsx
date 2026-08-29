"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deletePartner } from "@/actions/partners";
import { PartnerFormDialog } from "@/components/partners/partner-form-dialog";
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
import { ROUTES } from "@/constants/routes";
import type { PartnerListItem } from "@/types/partner";

type PartnerRowActionsProps = {
  partner: PartnerListItem;
  /** Send the admin back to the list after deleting from the detail page. */
  redirectOnDelete?: boolean;
};

export function PartnerRowActions({
  partner,
  redirectOnDelete = false,
}: PartnerRowActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  function onDelete() {
    startDelete(async () => {
      try {
        const result = await deletePartner({ id: partner.id });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setDeleteOpen(false);
        if (redirectOnDelete) {
          router.push(ROUTES.partners);
          return;
        }
        router.refresh();
      } catch {
        toast.error("The partner could not be deleted. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <PartnerFormDialog
        mode="edit"
        partner={partner}
        triggerRender={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${partner.name}`}
          />
        }
        triggerContent={<PencilIcon />}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Delete ${partner.name}`}
            />
          }
        >
          <Trash2Icon />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle>Delete partner?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes {partner.name} and removes the stored
              logo from Storage. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <Trash2Icon />
              )}
              {isDeleting ? "Deleting…" : "Delete partner"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
