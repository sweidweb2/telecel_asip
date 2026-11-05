"use server";

import { revalidatePath } from "next/cache";

import { getAdminResource } from "@/constants/admin-resources";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import {
  createCohortSchema,
  deleteCohortSchema,
  updateCohortSchema,
  type CreateCohortInput,
  type DeleteCohortInput,
  type UpdateCohortInput,
} from "@/validations/cohort";

export type CohortActionResult = AdminActionResult;

const resource = getAdminResource("cohorts");

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

function refreshCohortPaths(id?: string) {
  refreshAdminResource({
    listPath: resource.listPath,
    detailPath: id ? `${resource.listPath}/${id}` : undefined,
    cacheTags: resource.cacheTags,
  });
  // Related insight links are tagged with COHORTS_CACHE_TAG already — no blogs tag.
  revalidatePath("/en/program");
  revalidatePath("/fr/program");
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
  return runAdminMutation({
    schema: createCohortSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.createSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      const { data: rpcData, error } = await session.supabase.rpc(
        "create_cohort_with_links",
        {
          p_cohort: toCohortJson(data),
          p_partner_ids: data.partnerIds,
          p_startup_ids: data.startupIds,
        },
      );

      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (error || !row?.id) {
        return { status: "error", pgError: error ?? {} };
      }
      return { status: "success", id: row.id };
    },
    refresh: (_data, id) => refreshCohortPaths(id),
  });
}

export async function updateCohort(
  input: UpdateCohortInput,
): Promise<CohortActionResult> {
  return runAdminMutation({
    schema: updateCohortSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.updateSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      const { id, ...rest } = data;
      const { data: rpcData, error } = await session.supabase.rpc(
        "update_cohort_with_links",
        {
          p_id: id,
          p_cohort: toCohortJson(rest),
          p_partner_ids: rest.partnerIds,
          p_startup_ids: rest.startupIds,
        },
      );

      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (error || !row?.id) {
        return { status: "error", pgError: error ?? {} };
      }
      return { status: "success", id: row.id };
    },
    refresh: (_data, id) => refreshCohortPaths(id),
  });
}

export async function deleteCohort(
  input: DeleteCohortInput,
): Promise<CohortActionResult> {
  return runAdminMutation({
    schema: deleteCohortSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.deleteSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      const { data: existing } = await session.supabase
        .from("cohorts")
        .select("id")
        .eq("id", data.id)
        .maybeSingle();

      if (!existing) {
        return { status: "error", message: MESSAGES.notFound };
      }

      const { error } = await session.supabase
        .from("cohorts")
        .delete()
        .eq("id", data.id);

      if (error) {
        return { status: "error", pgError: error };
      }
      return { status: "success" };
    },
    refresh: (data) => refreshCohortPaths(data.id),
  });
}
