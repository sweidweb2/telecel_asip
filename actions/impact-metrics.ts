"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { IMPACT_METRICS_CACHE_TAG } from "@/data/impact-metrics";
import { createClient } from "@/lib/supabase/server";
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

function refreshImpactMetricPaths(id?: string) {
  revalidateTag(IMPACT_METRICS_CACHE_TAG, "max");
  revalidatePath(ROUTES.impactMetrics);
  if (id) {
    revalidatePath(`${ROUTES.impactMetrics}/${id}`);
  }
}

function emptyToNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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

function writeErrorMessage(error: { code?: string; message?: string }): string {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "42501" || message.includes("not authorized")) {
    return MESSAGES.unauthorized;
  }
  if (code === "23503" || message.includes("foreign key")) {
    return MESSAGES.evidenceNotFound;
  }
  if (code === "PGRST116" || message.includes("no rows")) {
    return MESSAGES.notFound;
  }
  return MESSAGES.genericError;
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

  const session = await authorizeAdmin();
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("impact_metrics")
    .insert(toImpactMetricRow(parsed.data))
    .select("id")
    .single();

  if (error || !data?.id) {
    return { status: "error", message: writeErrorMessage(error ?? {}) };
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

  const session = await authorizeAdmin();
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("impact_metrics")
    .update(toImpactMetricRow(parsed.data))
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: writeErrorMessage(error) };
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

  const session = await authorizeAdmin();
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
    return { status: "error", message: writeErrorMessage(deleteError) };
  }

  refreshImpactMetricPaths();
  return { status: "success", message: MESSAGES.deleteSuccess };
}
