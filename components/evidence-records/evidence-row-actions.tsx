"use client";

import Link from "next/link";
import { PencilIcon } from "lucide-react";

import { deleteEvidenceRecord } from "@/actions/evidence-records";
import { AdminRowDelete } from "@/components/dashboard/admin-row-delete";
import { EvidenceFormDialog } from "@/components/evidence-records/evidence-form-dialog";
import { Button } from "@/components/ui/button";
import { evidenceDetailPath, ROUTES } from "@/constants/routes";
import type {
  EvidenceDetail,
  EvidenceListItem,
  EvidenceOwnerOption,
} from "@/types/evidence-record";

type EvidenceRowActionsProps = {
  record: EvidenceListItem | EvidenceDetail;
  /** When set with a full detail record, enables inline edit. List rows omit this. */
  owners?: EvidenceOwnerOption[];
  defaultOwnerId?: string;
  redirectOnDelete?: boolean;
};

function isEvidenceDetail(
  record: EvidenceListItem | EvidenceDetail,
): record is EvidenceDetail {
  return "source_file_url" in record && "last_verified_date" in record;
}

export function EvidenceRowActions({
  record,
  owners,
  defaultOwnerId,
  redirectOnDelete = false,
}: EvidenceRowActionsProps) {
  const title =
    record.primary_source.length > 48
      ? `${record.primary_source.slice(0, 48)}…`
      : record.primary_source;

  return (
    <div className="flex items-center justify-end gap-0.5">
      {isEvidenceDetail(record) &&
      owners !== undefined &&
      defaultOwnerId !== undefined ? (
        <EvidenceFormDialog
          mode="edit"
          record={record}
          owners={owners}
          defaultOwnerId={defaultOwnerId}
          triggerRender={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Edit ${title}`}
            />
          }
          triggerContent={<PencilIcon />}
        />
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${title}`}
          nativeButton={false}
          render={<Link href={evidenceDetailPath(record.id)} />}
        >
          <PencilIcon />
        </Button>
      )}

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
