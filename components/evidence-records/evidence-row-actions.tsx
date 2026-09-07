"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { deleteEvidenceRecord } from "@/actions/evidence-records";
import { ADMIN_ICON_BUTTON_CLASS } from "@/components/dashboard/admin-icon-button";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { Button } from "@/components/ui/button";
import { evidenceDetailPath, ROUTES } from "@/constants/routes";
import type { EvidenceListItem } from "@/types/evidence-record";

type EvidenceRowActionsProps = {
  record: EvidenceListItem;
  redirectOnDelete?: boolean;
};

export function EvidenceRowActions({
  record,
  redirectOnDelete = false,
}: EvidenceRowActionsProps) {
  const title =
    record.primary_source.length > 48
      ? `${record.primary_source.slice(0, 48)}…`
      : record.primary_source;

  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className={ADMIN_ICON_BUTTON_CLASS}
        aria-label={`Edit ${title}`}
        nativeButton={false}
        render={<Link href={evidenceDetailPath(record.id)} />}
      >
        <PencilIcon />
      </Button>

      <AdminRowDelete
        deleteAction={() => deleteEvidenceRecord({ id: record.id })}
        redirectTo={redirectOnDelete ? ROUTES.evidence : undefined}
        fallbackError="The evidence record could not be deleted. Please try again."
        title="Delete evidence record?"
        description="This permanently deletes this evidence entry. Impact metrics that reference it will need a new source before they can stay verified. This cannot be undone."
        confirmLabel="Delete evidence"
        triggerLabel={`Delete ${title}`}
      />
    </div>
  );
}
