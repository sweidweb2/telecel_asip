"use client";

import { deletePartner } from "@/actions/partners";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { AdminRowEditLink } from "@/components/dashboard/admin-row-edit-link";
import { partnerDetailPath } from "@/constants/routes";
import type { PartnerListItem } from "@/types/partner";

type PartnerRowActionsProps = {
  partner: PartnerListItem;
};

export function PartnerRowActions({ partner }: PartnerRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <AdminRowEditLink
        href={partnerDetailPath(partner.id)}
        label={`Edit ${partner.name}`}
      />

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
