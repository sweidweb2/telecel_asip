"use client";

import { useState, useTransition } from "react";
import { useRouter } from "nextjs-toploader/app";
import { PencilIcon } from "lucide-react";
import { toast } from "sonner";

import { deletePartner } from "@/actions/partners";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { PartnerFormDialog } from "@/components/partners/partner-form-dialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import type { PartnerListItem } from "@/types/partner";

type PartnerRowActionsProps = {
  partner: PartnerListItem;
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

      <AdminDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete partner?"
        description={
          <>
            This permanently deletes {partner.name} and removes the stored logo
            from Storage. This cannot be undone.
          </>
        }
        confirmLabel="Delete partner"
        triggerLabel={`Delete ${partner.name}`}
        isPending={isDeleting}
        onConfirm={onDelete}
      />
    </div>
  );
}
