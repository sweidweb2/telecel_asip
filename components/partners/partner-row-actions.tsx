"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { deletePartner } from "@/actions/partners";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { Button } from "@/components/ui/button";
import { partnerDetailPath } from "@/constants/routes";
import type { PartnerListItem } from "@/types/partner";

type PartnerRowActionsProps = {
  partner: PartnerListItem;
};

export function PartnerRowActions({ partner }: PartnerRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
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

      <AdminRowDelete
        deleteAction={() => deletePartner({ id: partner.id })}
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
