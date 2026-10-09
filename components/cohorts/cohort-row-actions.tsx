"use client";

import { deleteCohort } from "@/actions/cohorts";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { AdminRowEditLink } from "@/components/dashboard/admin-row-edit-link";
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
      <AdminRowEditLink
        href={cohortEditPath(cohort.id)}
        label={`Edit ${cohort.public_label}`}
      />

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
