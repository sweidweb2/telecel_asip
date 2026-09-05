"use server";

import { getAdminResource } from "@/constants/admin-resources";
import { listEvidenceOptionsForAdmin } from "@/data/impact-metrics";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import type { EvidenceOption } from "@/types/impact-metric";
import {
  createImpactMetricSchema,
  deleteImpactMetricSchema,
  updateImpactMetricSchema,
  type CreateImpactMetricInput,
  type DeleteImpactMetricInput,
  type UpdateImpactMetricInput,
} from "@/validations/impact-metric";

export type ImpactMetricActionResult = AdminActionResult;

const resource = getAdminResource("impactMetrics");

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

/** Lazy option load for the create dialog (list page skips eager fetch). */
export async function loadImpactEvidenceOptions(
  search = "",
): Promise<
  | { status: "ok"; options: EvidenceOption[] }
  | { status: "error"; message: string }
> {
  const result = await listEvidenceOptionsForAdmin(search);
  if (result.status === "forbidden") {
    return { status: "error", message: MESSAGES.unauthorized };
  }
  return { status: "ok", options: result.options };
}

const PG_MESSAGES = {
  unauthorized: MESSAGES.unauthorized,
  notFound: MESSAGES.notFound,
  genericError: MESSAGES.genericError,
  foreignKeyWrite: MESSAGES.evidenceNotFound,
};

function refreshImpactMetricPaths(id?: string) {
  refreshAdminResource({
    listPath: resource.listPath,
    detailPath: id ? `${resource.listPath}/${id}` : undefined,
    cacheTags: resource.cacheTags,
  });
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
  return runAdminMutation({
    schema: createImpactMetricSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.createSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("impact_metrics")
        .insert(toImpactMetricRow(data))
        .select("id")
        .single();

      if (error || !row?.id) {
        return { status: "error", pgError: error ?? {} };
      }
      return { status: "success", id: row.id };
    },
    refresh: (_data, id) => refreshImpactMetricPaths(id),
  });
}

export async function updateImpactMetric(
  input: UpdateImpactMetricInput,
): Promise<ImpactMetricActionResult> {
  return runAdminMutation({
    schema: updateImpactMetricSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.updateSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("impact_metrics")
        .update(toImpactMetricRow(data))
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
    refresh: (_data, id) => refreshImpactMetricPaths(id),
  });
}

export async function deleteImpactMetric(
  input: DeleteImpactMetricInput,
): Promise<ImpactMetricActionResult> {
  return runAdminMutation({
    schema: deleteImpactMetricSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.deleteSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      const { data: existing, error: existingError } = await session.supabase
        .from("impact_metrics")
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
        .from("impact_metrics")
        .delete()
        .eq("id", data.id);

      if (deleteError) {
        return { status: "error", pgError: deleteError };
      }
      return { status: "success" };
    },
    refresh: () => refreshImpactMetricPaths(),
  });
}
