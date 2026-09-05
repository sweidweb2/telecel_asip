"use client";

import { PencilIcon } from "lucide-react";

import { deletePartner } from "@/actions/partners";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
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

      <AdminRowDelete
        deleteAction={() => deletePartner({ id: partner.id })}
        redirectTo={redirectOnDelete ? ROUTES.partners : undefined}
        fallbackError="The partner could not be deleted. Please try again."
        title="Delete partner?"
        description={
          <>
            This permanently deletes {partner.name} and removes the stored logo
            from Storage. This cannot be undone.
          </>
        }
        confirmLabel="Delete partner"
        triggerLabel={`Delete ${partner.name}`}
      />
    </div>
  );
}
