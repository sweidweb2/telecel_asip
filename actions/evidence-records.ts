"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { getEvidenceOwnerOptions } from "@/data/evidence-records";
import { getCurrentUserProfile } from "@/data/users";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import type { EvidenceOwnerOption } from "@/types/evidence-record";
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

/** Lazy option load for the create dialog (list page skips eager fetch). */
export async function loadEvidenceFormOptions(
  search = "",
): Promise<
  | {
      status: "ok";
      owners: EvidenceOwnerOption[];
      defaultOwnerId: string;
    }
  | { status: "error"; message: string }
> {
  const [ownersResult, profile] = await Promise.all([
    getEvidenceOwnerOptions(search),
    getCurrentUserProfile(),
  ]);
  if (ownersResult.status === "forbidden") {
    return { status: "error", message: MESSAGES.unauthorized };
  }
  const owners = ownersResult.owners;
  return {
    status: "ok",
    owners,
    defaultOwnerId: profile?.id ?? owners[0]?.id ?? "",
  };
}

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
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("evidence_records")
        .insert(toEvidenceRow(data))
        .select("id")
        .single();

      if (error || !row?.id) {
        return { status: "error", pgError: error ?? {} };
      }
      return { status: "success", id: row.id };
    },
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
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("evidence_records")
        .update(toEvidenceRow(data))
        .eq("id", data.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return { status: "error", pgError: error };
      }
      if (!row?.id) {
        return { status: "error", message: MESSAGES.notFound };
      }
      return { status: "success", id: row.id };
    },
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
    execute: async (session, data) => {
      const { data: existing, error: existingError } = await session.supabase
        .from("evidence_records")
        .select("id")
        .eq("id", data.id)
        .maybeSingle();

      if (existingError) {
        return { status: "error", message: MESSAGES.genericError };
      }
      if (!existing) {
        return { status: "error", message: MESSAGES.notFound };
      }

      const { error: deleteError } = await session.supabase
        .from("evidence_records")
        .delete()
        .eq("id", data.id);

      if (deleteError) {
        return {
          status: "error",
          pgError: deleteError,
          pgContext: "delete",
        };
      }
      return { status: "success" };
    },
    refresh: () => refreshEvidencePaths(),
  });
}
