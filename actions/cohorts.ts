"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { COHORTS_CACHE_TAG } from "@/data/cohorts";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  createCohortSchema,
  deleteCohortSchema,
  updateCohortSchema,
  type CreateCohortInput,
  type DeleteCohortInput,
  type UpdateCohortInput,
} from "@/validations/cohort";

export type CohortActionResult =
  | { status: "success"; message: string; id?: string }
  | { status: "error"; message: string };

const MESSAGES = {
  unauthorized: "You do not have permission to manage cohorts.",
  signedInRequired: "You must be signed in.",
  invalidDetails: "Please check the form and try again.",
  createSuccess: "Cohort created successfully.",
  updateSuccess: "Cohort updated successfully.",
  deleteSuccess: "Cohort deleted successfully.",
  notFound: "Cohort not found.",
  genericError: "Something went wrong. Please try again.",
  labelTaken: "A cohort with that year and public label already exists.",
} as const;

const PG_MESSAGES = {
  unauthorized: MESSAGES.unauthorized,
  notFound: MESSAGES.notFound,
  genericError: MESSAGES.genericError,
  uniqueViolation: MESSAGES.labelTaken,
  uniqueConstraint: "cohorts_year_public_label",
};

function refreshCohortPaths() {
  revalidateTag(COHORTS_CACHE_TAG, "max");
  revalidatePath(ROUTES.cohorts);
}

function toCohortJson(input: CreateCohortInput) {
  return {
    year: input.year,
    public_label: input.publicLabel,
    programme_dates_start: input.programmeDatesStart || "",
    programme_dates_end: input.programmeDatesEnd || "",
    programme_status: input.programmeStatus,
    summary: input.summary || "",
    media_url: input.mediaUrl || "",
    publish_status: input.publishStatus,
  };
}

export async function createCohort(
  input: CreateCohortInput,
): Promise<CohortActionResult> {
  const parsed = createCohortSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase.rpc("create_cohort_with_links", {
    p_cohort: toCohortJson(parsed.data),
    p_partner_ids: parsed.data.partnerIds,
    p_startup_ids: parsed.data.startupIds,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row?.id) {
    return {
      status: "error",
      message: mapPgActionError(error ?? {}, PG_MESSAGES),
    };
  }

  refreshCohortPaths();
  return {
    status: "success",
    message: MESSAGES.createSuccess,
    id: row.id,
  };
}

export async function updateCohort(
  input: UpdateCohortInput,
): Promise<CohortActionResult> {
  const parsed = updateCohortSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { id, ...rest } = parsed.data;

  const { data, error } = await session.supabase.rpc("update_cohort_with_links", {
    p_id: id,
    p_cohort: toCohortJson(rest),
    p_partner_ids: rest.partnerIds,
    p_startup_ids: rest.startupIds,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row?.id) {
    return {
      status: "error",
      message: mapPgActionError(error ?? {}, PG_MESSAGES),
    };
  }

  refreshCohortPaths();
  revalidatePath(`${ROUTES.cohorts}/${id}`);
  return { status: "success", message: MESSAGES.updateSuccess, id: row.id };
}

export async function deleteCohort(
  input: DeleteCohortInput,
): Promise<CohortActionResult> {
  const parsed = deleteCohortSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing } = await session.supabase
    .from("cohorts")
    .select("id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!existing) {
    return { status: "error", message: MESSAGES.notFound };
  }

  const { error } = await session.supabase
    .from("cohorts")
    .delete()
    .eq("id", parsed.data.id);

  if (error) {
    return { status: "error", message: mapPgActionError(error, PG_MESSAGES) };
  }

  refreshCohortPaths();
  return { status: "success", message: MESSAGES.deleteSuccess };
}
