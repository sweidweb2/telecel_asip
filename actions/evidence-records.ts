"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  createEvidenceRecordSchema,
  deleteEvidenceRecordSchema,
  updateEvidenceRecordSchema,
  type CreateEvidenceRecordInput,
  type DeleteEvidenceRecordInput,
  type UpdateEvidenceRecordInput,
} from "@/validations/evidence-record";

export type EvidenceActionResult =
  | { status: "success"; message: string; id?: string }
  | { status: "error"; message: string };

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
  revalidatePath(ROUTES.evidence);
  if (id) revalidatePath(`${ROUTES.evidence}/${id}`);
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
  const parsed = createEvidenceRecordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("evidence_records")
    .insert(toEvidenceRow(parsed.data))
    .select("id")
    .single();

  if (error || !data?.id) {
    return {
      status: "error",
      message: mapPgActionError(error ?? {}, PG_MESSAGES),
    };
  }

  refreshEvidencePaths(data.id);
  return { status: "success", message: MESSAGES.createSuccess, id: data.id };
}

export async function updateEvidenceRecord(
  input: UpdateEvidenceRecordInput,
): Promise<EvidenceActionResult> {
  const parsed = updateEvidenceRecordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("evidence_records")
    .update(toEvidenceRow(parsed.data))
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: mapPgActionError(error, PG_MESSAGES) };
  }
  if (!data?.id) {
    return { status: "error", message: MESSAGES.notFound };
  }

  refreshEvidencePaths(data.id);
  return { status: "success", message: MESSAGES.updateSuccess, id: data.id };
}

export async function deleteEvidenceRecord(
  input: DeleteEvidenceRecordInput,
): Promise<EvidenceActionResult> {
  const parsed = deleteEvidenceRecordSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("evidence_records")
    .select("id")
    .eq("id", parsed.data.id)
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
    .eq("id", parsed.data.id);

  if (deleteError) {
    return {
      status: "error",
      message: mapPgActionError(deleteError, PG_MESSAGES, "delete"),
    };
  }

  refreshEvidencePaths(parsed.data.id);
  return { status: "success", message: MESSAGES.deleteSuccess };
}
