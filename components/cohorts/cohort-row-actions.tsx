"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { deleteCohort } from "@/actions/cohorts";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { Button } from "@/components/ui/button";
import { cohortEditPath, ROUTES } from "@/constants/routes";
import type { CohortListItem } from "@/types/cohort";

type CohortRowActionsProps = {
  cohort: CohortListItem;
  redirectOnDelete?: boolean;
};

export function CohortRowActions({
  cohort,
  redirectOnDelete = false,
}: CohortRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className={ADMIN_ICON_BUTTON_CLASS}
        aria-label={`Edit ${cohort.public_label}`}
        nativeButton={false}
        render={<Link href={cohortEditPath(cohort.id)} />}
      >
        <PencilIcon />
      </Button>

      <AdminRowDelete
        deleteAction={() => deleteCohort({ id: cohort.id })}
        redirectTo={redirectOnDelete ? ROUTES.cohorts : undefined}
        fallbackError="The cohort could not be deleted. Please try again."
        title="Delete cohort?"
        description={
          <>
            This permanently deletes {cohort.public_label} and its partner /
            founder links. This cannot be undone.
          </>
        }
        confirmLabel="Delete cohort"
        triggerLabel={`Delete ${cohort.public_label}`}
      />
    </div>
  );
}
