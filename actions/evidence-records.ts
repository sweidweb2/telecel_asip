"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { writeAdminRow } from "@/lib/admin/write-admin-row";
import {
  createEvidenceRecordSchema,
  deleteEvidenceRecordSchema,
  updateEvidenceRecordSchema,
  type CreateEvidenceRecordInput,
  type DeleteEvidenceRecordInput,
  type UpdateEvidenceRecordInput,
} from "@/validations/evidence-record";

export type EvidenceActionResult = AdminActionResult;

const resource = getAdminResource("evidence");

const MESSAGES = {
  unauthorized: "You do not have permission to manage evidence records.",
  signedInRequired: "You must be signed in.",
  invalidDetails: "Please check the form and try again.",
  createSuccess: "Evidence record created successfully.",
  updateSuccess: "Evidence record updated successfully.",
  deleteSuccess: "Evidence record deleted successfully.",
  notFound: "Evidence record not found.",
  invalidOwner: "Selected owner is not a valid profile.",
  deleteInUse:
    "This evidence record is linked to impact metrics. Remove or reassign those metrics first.",
  genericError: "Something went wrong. Please try again.",
} as const;

const PG_MESSAGES = {
  unauthorized: MESSAGES.unauthorized,
  notFound: MESSAGES.notFound,
  genericError: MESSAGES.genericError,
  foreignKeyWrite: MESSAGES.invalidOwner,
  foreignKeyDelete: MESSAGES.deleteInUse,
};

function refreshEvidencePaths(id?: string) {
  refreshAdminResource({
    listPath: resource.listPath,
    detailPath: id ? `${resource.listPath}/${id}` : undefined,
    cacheTags: resource.cacheTags,
  });
}

function toEvidenceRow(
  input: CreateEvidenceRecordInput | UpdateEvidenceRecordInput,
) {
  return {
    primary_source: input.primarySource,
    source_file_url: emptyToNull(input.sourceFileUrl),
    measurement_period_start: input.measurementPeriodStart,
    measurement_period_end: input.measurementPeriodEnd,
    owner_id: input.ownerId,
    status: input.status,
    last_verified_date: input.lastVerifiedDate,
    permission: input.permission,
    review_date: input.reviewDate,
  };
}

export async function createEvidenceRecord(
  input: CreateEvidenceRecordInput,
): Promise<EvidenceActionResult> {
  return runAdminMutation({
    schema: createEvidenceRecordSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.createSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: (session, data) =>
      writeAdminRow(session.supabase, {
        op: "insert",
        table: "evidence_records",
        values: toEvidenceRow(data),
      }),
    refresh: (_data, id) => refreshEvidencePaths(id),
  });
}

export async function updateEvidenceRecord(
  input: UpdateEvidenceRecordInput,
): Promise<EvidenceActionResult> {
  return runAdminMutation({
    schema: updateEvidenceRecordSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.updateSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: (session, data) =>
      writeAdminRow(session.supabase, {
        op: "update",
        table: "evidence_records",
        id: data.id,
        values: toEvidenceRow(data),
        notFound: MESSAGES.notFound,
      }),
    refresh: (_data, id) => refreshEvidencePaths(id),
  });
}

export async function deleteEvidenceRecord(
  input: DeleteEvidenceRecordInput,
): Promise<EvidenceActionResult> {
  return runAdminMutation({
    schema: deleteEvidenceRecordSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.deleteSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: (session, data) =>
      writeAdminRow(session.supabase, {
        op: "delete",
        table: "evidence_records",
        id: data.id,
        notFound: MESSAGES.notFound,
        pgContext: "delete",
      }),
    refresh: () => refreshEvidencePaths(),
  });
}
