"use server";

import { revalidatePath } from "next/cache";

import { getAdminResource } from "@/constants/admin-resources";
import { UPLOAD_MAX_BYTES } from "@/constants/upload";
import { authorizeEditor } from "@/lib/admin/authorize-editor";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  refreshAdminResource,
  runAdminMutation
} from "@/lib/admin/run-admin-mutation";
import { traceAsync } from "@/lib/admin/perf";
import {
  removeOwnedPublicStorageObject,
  uploadVersionedPublicImage,
} from "@/lib/media/upload-versioned-public-image";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionResult } from "@/types/admin-action";
import {
  cohortIdSchema,
  createCohortSchema,
  deleteCohortSchema,
  updateCohortSchema,
  type CreateCohortInput,
  type DeleteCohortInput,
  type UpdateCohortInput,
} from "@/validations/cohort";

export type CohortActionResult = AdminActionResult;

const resource = getAdminResource("cohorts");

const MEDIA_BUCKET = "cohorts";
const MEDIA_MAX_BYTES = UPLOAD_MAX_BYTES;

const MESSAGES = {
  unauthorized: "You do not have permission to manage cohorts.",
  signedInRequired: "You must be signed in.",
  invalidDetails: "Please check the form and try again.",
  createSuccess: "Cohort created successfully.",
  updateSuccess: "Cohort updated successfully.",
  deleteSuccess: "Cohort deleted successfully.",
  uploadSuccess: "Media uploaded successfully.",
  removeSuccess: "Media removed successfully.",
  notFound: "Cohort not found.",
  genericError: "Something went wrong. Please try again.",
  labelTaken: "A cohort with that year and public label already exists.",
  invalidImage: "Please upload a JPEG, PNG, WebP, or GIF under 10 MB.",
} as const;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

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

function writeErrorMessage(error: { code?: string; message?: string }): string {
  return mapPgActionError(error, PG_MESSAGES) ?? MESSAGES.genericError;
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

async function removeStoragePaths(
  supabase: SupabaseServerClient,
  paths: string[],
) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  if (error) {
    console.error("Failed to remove storage objects", {
      bucket: MEDIA_BUCKET,
      paths,
      error,
    });
  }
}

async function removeCohortStorageFolder(
  supabase: SupabaseServerClient,
  cohortId: string,
) {
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list(cohortId, { limit: 100 });

  if (error) {
    console.error("Failed to list cohort storage folder", {
      bucket: MEDIA_BUCKET,
      cohortId,
      error,
    });
    return;
  }

  await removeStoragePaths(
    supabase,
    (data ?? []).map((object) => `${cohortId}/${object.name}`),
  );
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
      // Media is owned by upload/remove actions — never let a form save wipe
      // a Storage URL that was set after the page loaded.
      const { data: existingMedia, error: mediaLookupError } =
        await session.supabase
          .from("cohorts")
          .select("media_url")
          .eq("id", id)
          .maybeSingle();
      if (mediaLookupError) {
        return { status: "error", message: MESSAGES.genericError };
      }

      const cohortJson = {
        ...toCohortJson(rest),
        media_url: existingMedia?.media_url ?? "",
      };

      const { data: rpcData, error } = await session.supabase.rpc(
        "update_cohort_with_links",
        {
          p_id: id,
          p_cohort: cohortJson,
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

      await removeCohortStorageFolder(session.supabase, data.id);
      return { status: "success" };
    },
    refresh: (data) => refreshCohortPaths(data.id),
  });
}

export async function uploadCohortMedia(
  cohortId: string,
  formData: FormData,
): Promise<CohortActionResult> {
  return traceAsync(
    "uploadCohortMedia",
    { eventType: "upload", cacheStatus: "n_a", meta: { cohortId } },
    async () => {
      if (!cohortIdSchema.safeParse(cohortId).success) {
        return { status: "error", message: MESSAGES.invalidDetails };
      }

      const file = formData.get("file");
      if (!(file instanceof File)) {
        return { status: "error", message: MESSAGES.invalidImage };
      }

      const session = await authorizeEditor(MESSAGES);
      if (session.status === "error") return session;

      const { data: existing, error: existingError } = await session.supabase
        .from("cohorts")
        .select("id, media_url")
        .eq("id", cohortId)
        .maybeSingle();

      if (existingError) {
        return { status: "error", message: MESSAGES.genericError };
      }
      if (!existing) {
        return { status: "error", message: MESSAGES.notFound };
      }

      const uploaded = await uploadVersionedPublicImage({
        supabase: session.supabase,
        file,
        bucket: MEDIA_BUCKET,
        entityId: cohortId,
        preset: "cohortCover",
        previousUrl: existing.media_url,
        maxBytes: MEDIA_MAX_BYTES,
        messages: MESSAGES,
        updateRow: async (publicUrl) =>
          session.supabase
            .from("cohorts")
            .update({ media_url: publicUrl })
            .eq("id", cohortId)
            .select("id")
            .maybeSingle(),
      });

      if (uploaded.status === "error") return uploaded;

      refreshCohortPaths(cohortId);
      return {
        status: "success",
        message: MESSAGES.uploadSuccess,
        id: cohortId,
      };
    },
  );
}

export async function removeCohortMedia(
  cohortId: string,
): Promise<CohortActionResult> {
  if (!cohortIdSchema.safeParse(cohortId).success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("cohorts")
    .select("id, media_url")
    .eq("id", cohortId)
    .maybeSingle();

  if (existingError) {
    return { status: "error", message: MESSAGES.genericError };
  }
  if (!existing) {
    return { status: "error", message: MESSAGES.notFound };
  }

  const { error: updateError } = await session.supabase
    .from("cohorts")
    .update({ media_url: null })
    .eq("id", cohortId);

  if (updateError) {
    return { status: "error", message: writeErrorMessage(updateError) };
  }

  await removeOwnedPublicStorageObject(
    session.supabase,
    existing.media_url,
    MEDIA_BUCKET,
  );
  refreshCohortPaths(cohortId);
  return { status: "success", message: MESSAGES.removeSuccess, id: cohortId };
}
