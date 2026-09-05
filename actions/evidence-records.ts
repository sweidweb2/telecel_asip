"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
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

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type AdminSession =
  | {
      status: "success";
      supabase: SupabaseServerClient;
    }
  | { status: "error"; message: string };

async function authorizeAdmin(): Promise<AdminSession> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "error", message: MESSAGES.signedInRequired };
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) {
    return { status: "error", message: MESSAGES.unauthorized };
  }

  return { status: "success", supabase };
}

function refreshEvidencePaths(id?: string) {
  revalidatePath(ROUTES.evidence);
  if (id) revalidatePath(`${ROUTES.evidence}/${id}`);
}

function emptyToNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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

function writeErrorMessage(
  error: { code?: string; message?: string },
  context: "write" | "delete" = "write",
): string {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "42501" || message.includes("not authorized")) {
    return MESSAGES.unauthorized;
  }
  if (code === "PGRST116" || message.includes("no rows")) {
    return MESSAGES.notFound;
  }
  if (code === "23503" || message.includes("foreign key")) {
    if (context === "delete") {
      return MESSAGES.deleteInUse;
    }
    if (message.includes("owner") || message.includes("profiles")) {
      return MESSAGES.invalidOwner;
    }
    return MESSAGES.invalidOwner;
  }
  return MESSAGES.genericError;
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

  const session = await authorizeAdmin();
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("evidence_records")
    .insert(toEvidenceRow(parsed.data))
    .select("id")
    .single();

  if (error || !data?.id) {
    return { status: "error", message: writeErrorMessage(error ?? {}) };
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

  const session = await authorizeAdmin();
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("evidence_records")
    .update(toEvidenceRow(parsed.data))
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: writeErrorMessage(error) };
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

  const session = await authorizeAdmin();
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
      message: writeErrorMessage(deleteError, "delete"),
    };
  }

  refreshEvidencePaths(parsed.data.id);
  return { status: "success", message: MESSAGES.deleteSuccess };
}
