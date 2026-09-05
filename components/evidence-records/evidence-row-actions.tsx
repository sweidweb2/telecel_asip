"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { deleteEvidenceRecord } from "@/actions/evidence-records";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { EvidenceFormDialog } from "@/components/evidence-records/evidence-form-dialog";
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

      <AdminDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete evidence record?"
        description="This permanently deletes this evidence entry. Impact metrics that reference it will need a new source before they can stay verified. This cannot be undone."
        confirmLabel="Delete evidence"
        triggerLabel={`Delete ${title}`}
        isPending={isDeleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
