"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { IMPACT_METRICS_CACHE_TAG } from "@/data/impact-metrics";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  createImpactMetricSchema,
  deleteImpactMetricSchema,
  updateImpactMetricSchema,
  type CreateImpactMetricInput,
  type DeleteImpactMetricInput,
  type UpdateImpactMetricInput,
} from "@/validations/impact-metric";

export type ImpactMetricActionResult =
  | { status: "success"; message: string; id?: string }
  | { status: "error"; message: string };

const MESSAGES = {
  unauthorized: "You do not have permission to manage impact metrics.",
  signedInRequired: "You must be signed in.",
  invalidDetails: "Please check the form and try again.",
  createSuccess: "Impact metric created successfully.",
  updateSuccess: "Impact metric updated successfully.",
  deleteSuccess: "Impact metric deleted successfully.",
  notFound: "Impact metric not found.",
  evidenceNotFound: "Selected evidence record was not found.",
  genericError: "Something went wrong. Please try again.",
} as const;

const PG_MESSAGES = {
  unauthorized: MESSAGES.unauthorized,
  notFound: MESSAGES.notFound,
  genericError: MESSAGES.genericError,
  foreignKeyWrite: MESSAGES.evidenceNotFound,
};

function refreshImpactMetricPaths(id?: string) {
  revalidateTag(IMPACT_METRICS_CACHE_TAG, "max");
  revalidatePath(ROUTES.impactMetrics);
  if (id) {
    revalidatePath(`${ROUTES.impactMetrics}/${id}`);
  }
}

function toImpactMetricRow(
  input: CreateImpactMetricInput | UpdateImpactMetricInput,
) {
  const displayLocations =
    input.displayLocations.length > 0 ? input.displayLocations : null;

  return {
    claim_label: input.claimLabel,
    value: input.value,
    unit: emptyToNull(input.unit),
    period_start: input.periodStart,
    period_end: input.periodEnd,
    geography: emptyToNull(input.geography),
    impact_lens: input.impactLens ?? null,
    display_locations: displayLocations,
    evidence_id: input.evidenceId,
    publish_status: input.publishStatus,
  };
}

export async function createImpactMetric(
  input: CreateImpactMetricInput,
): Promise<ImpactMetricActionResult> {
  const parsed = createImpactMetricSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("impact_metrics")
    .insert(toImpactMetricRow(parsed.data))
    .select("id")
    .single();

  if (error || !data?.id) {
    return {
      status: "error",
      message: mapPgActionError(error ?? {}, PG_MESSAGES),
    };
  }

  refreshImpactMetricPaths(data.id);
  return { status: "success", message: MESSAGES.createSuccess, id: data.id };
}

export async function updateImpactMetric(
  input: UpdateImpactMetricInput,
): Promise<ImpactMetricActionResult> {
  const parsed = updateImpactMetricSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("impact_metrics")
    .update(toImpactMetricRow(parsed.data))
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: mapPgActionError(error, PG_MESSAGES) };
  }
  if (!data?.id) {
    return { status: "error", message: MESSAGES.notFound };
  }

  refreshImpactMetricPaths(data.id);
  return { status: "success", message: MESSAGES.updateSuccess, id: data.id };
}

export async function deleteImpactMetric(
  input: DeleteImpactMetricInput,
): Promise<ImpactMetricActionResult> {
  const parsed = deleteImpactMetricSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("impact_metrics")
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
    .from("impact_metrics")
    .delete()
    .eq("id", parsed.data.id);

  if (deleteError) {
    return { status: "error", message: mapPgActionError(deleteError, PG_MESSAGES) };
  }

  refreshImpactMetricPaths();
  return { status: "success", message: MESSAGES.deleteSuccess };
}
