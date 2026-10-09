"use client";

import { deleteStartup } from "@/actions/startups";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { AdminRowEditLink } from "@/components/dashboard/admin-row-edit-link";
import { portfolioEditPath, ROUTES } from "@/constants/routes";
import type { StartupListItem } from "@/types/startup";

type StartupRowActionsProps = {
  startup: StartupListItem;
  redirectOnDelete?: boolean;
};

export function StartupRowActions({
  startup,
  redirectOnDelete = false,
}: StartupRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <AdminRowEditLink
        href={portfolioEditPath(startup.id)}
        label={`Edit ${startup.name}`}
      />

      <AdminRowDelete
        deleteAction={() => deleteStartup({ id: startup.id })}
        redirectTo={redirectOnDelete ? ROUTES.portfolio : undefined}
        fallbackError="The startup could not be deleted. Please try again."
        title="Delete startup?"
        description={
          <>
            This permanently deletes {startup.name} and its logo. This cannot be
            undone.
          </>
        }
        confirmLabel="Delete startup"
        triggerLabel={`Delete ${startup.name}`}
      />
    </div>
  );
}
