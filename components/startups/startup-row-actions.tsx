"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { deleteStartup } from "@/actions/startups";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { Button } from "@/components/ui/button";
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
      <Button
        variant="ghost"
        size="icon"
        className={ADMIN_ICON_BUTTON_CLASS}
        aria-label={`Edit ${startup.name}`}
        nativeButton={false}
        render={<Link href={portfolioEditPath(startup.id)} />}
      >
        <PencilIcon />
      </Button>

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
