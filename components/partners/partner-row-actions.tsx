"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { deletePartner } from "@/actions/partners";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { Button } from "@/components/ui/button";
import { partnerDetailPath, ROUTES } from "@/constants/routes";
import type { PartnerListItem } from "@/types/partner";

type PartnerRowActionsProps = {
  partner: PartnerListItem;
  redirectOnDelete?: boolean;
  /** Detail page passes the edit dialog; list uses a link to the detail. */
  editSlot?: React.ReactNode;
};

export function PartnerRowActions({
  partner,
  redirectOnDelete = false,
  editSlot,
}: PartnerRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {editSlot ?? (
        <Button
          variant="ghost"
          size="icon"
          className={ADMIN_ICON_BUTTON_CLASS}
          aria-label={`Edit ${partner.name}`}
          nativeButton={false}
          render={<Link href={partnerDetailPath(partner.id)} />}
        >
          <PencilIcon />
        </Button>
      )}

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
