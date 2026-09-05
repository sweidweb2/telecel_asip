"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { deleteEvidenceRecord } from "@/actions/evidence-records";
import { EvidenceFormDialog } from "@/components/evidence-records/evidence-form-dialog";
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
import type {
  EvidenceListItem,
  EvidenceOwnerOption,
} from "@/types/evidence-record";

type EvidenceRowActionsProps = {
  record: EvidenceListItem;
  owners: EvidenceOwnerOption[];
  defaultOwnerId: string;
  redirectOnDelete?: boolean;
};

export function EvidenceRowActions({
  record,
  owners,
  defaultOwnerId,
  redirectOnDelete = false,
}: EvidenceRowActionsProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  function onDelete() {
    startDelete(async () => {
      try {
        const result = await deleteEvidenceRecord({ id: record.id });
        if (result.status === "error") {
          toast.error(result.message);
          return;
        }
        toast.success(result.message);
        setDeleteOpen(false);
        if (redirectOnDelete) {
          router.push(ROUTES.evidence);
          return;
        }
        router.refresh();
      } catch {
        toast.error(
          "The evidence record could not be deleted. Please try again.",
        );
      }
    });
  }

  const title =
    record.primary_source.length > 48
      ? `${record.primary_source.slice(0, 48)}…`
      : record.primary_source;

  return (
    <div className="flex items-center justify-end gap-0.5">
      <EvidenceFormDialog
        mode="edit"
        record={record}
        owners={owners}
        defaultOwnerId={defaultOwnerId}
        triggerRender={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${title}`}
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
              aria-label={`Delete ${title}`}
            />
          }
        >
          <Trash2Icon />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader className="text-left">
            <AlertDialogTitle>Delete evidence record?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes this evidence entry. Impact metrics that
              reference it will need a new source before they can stay verified.
              This cannot be undone.
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
              {isDeleting ? "Deleting…" : "Delete evidence"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
