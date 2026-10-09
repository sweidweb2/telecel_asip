"use client";

import { deleteEvidenceRecord } from "@/actions/evidence-records";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { AdminRowEditLink } from "@/components/dashboard/admin-row-edit-link";
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
      <AdminRowEditLink
        href={evidenceDetailPath(record.id)}
        label={`Edit ${title}`}
      />

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
