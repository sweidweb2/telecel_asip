"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { UPLOAD_MAX_BYTES } from "@/constants/upload";
import { STARTUPS_CACHE_TAG } from "@/data/startups";
import { authorizeEditor } from "@/lib/admin/authorize-editor";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  revalidateDashboardNavCounts,
  runAdminMutation,
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import {
  removeOwnedPublicStorageObject,
  uploadVersionedPublicImage,
} from "@/lib/media/upload-versioned-public-image";
import { createClient } from "@/lib/supabase/server";
import {
  createStartupSchema,
  deleteStartupSchema,
  startupIdSchema,
  updateStartupSchema,
  type CreateStartupInput,
  type DeleteStartupInput,
  type UpdateStartupInput,
} from "@/validations/startup";

export type StartupActionResult = AdminActionResult;

const MESSAGES = {
  unauthorized: "You do not have permission to manage startups.",
  signedInRequired: "You must be signed in.",
  invalidDetails: "Please check the form and try again.",
  createSuccess: "Startup created successfully.",
  updateSuccess: "Startup updated successfully.",
  deleteSuccess: "Startup deleted successfully.",
  uploadSuccess: "Logo uploaded successfully.",
  removeSuccess: "Logo removed successfully.",
  coverUploadSuccess: "Cover image uploaded successfully.",
  coverRemoveSuccess: "Cover image removed successfully.",
  notFound: "Startup not found.",
  genericError: "Something went wrong. Please try again.",
  slugTaken: "That slug is already in use.",
  invalidImage: "Please upload a JPEG, PNG, WebP, or GIF under 10 MB.",
} as const;

const MEDIA_BUCKET = "startups";
const MEDIA_MAX_BYTES = UPLOAD_MAX_BYTES;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function refreshStartupPaths(slug?: string, id?: string) {
  revalidateTag(STARTUPS_CACHE_TAG, "max");
  // Related insight links are tagged with STARTUPS_CACHE_TAG already — no blogs tag.
  revalidateDashboardNavCounts();
  revalidatePath(ROUTES.portfolio);
  if (id) {
    revalidatePath(`${ROUTES.portfolio}/${id}`);
  }
  revalidatePath("/en/founders");
  revalidatePath("/fr/founders");
  if (slug) {
    revalidatePath(`/en/founders/${slug}`);
    revalidatePath(`/fr/founders/${slug}`);
  }
}

function uniqueConstraintMessage(error: {
  code?: string;
  message?: string;
}): string | null {
  const message = (error.message ?? "").toLowerCase();
  const isUnique = error.code === "23505" || message.includes("startups_slug");
  if (!isUnique) return null;
  return MESSAGES.slugTaken;
}

function rpcErrorMessage(error: { code?: string; message?: string }): string {
  const unique = uniqueConstraintMessage(error);
  if (unique) return unique;

  return mapPgActionError(error, {
    unauthorized: MESSAGES.unauthorized,
    notFound: MESSAGES.notFound,
    genericError: MESSAGES.genericError,
  });
}

function toStartupCoreJson(input: CreateStartupInput | UpdateStartupInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description,
    status: input.status,
    founded_at: emptyToNull(input.foundedAt),
  };
}

function toDetailsJson(
  details: CreateStartupInput["details"] | UpdateStartupInput["details"],
  coverImageUrl?: string | null,
) {
  return {
    website_url: emptyToNull(details.websiteUrl),
    industry: emptyToNull(details.industry),
    category: emptyToNull(details.category),
    location: emptyToNull(details.location),
    cohort: emptyToNull(details.cohort),
    country_code: emptyToNull(details.countryCode)?.toUpperCase() ?? null,
    sector: emptyToNull(details.sector),
    founder_names: (details.founderNames ?? "")
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean),
    // Cover is owned by upload/remove — create starts empty; update passes DB value.
    cover_image_url:
      coverImageUrl !== undefined
        ? emptyToNull(coverImageUrl)
        : emptyToNull(details.coverImageUrl),
    public_outcome: emptyToNull(details.publicOutcome),
    featured: details.featured ?? false,
    image_focal_x: details.imageFocalX ?? 50,
    image_focal_y: details.imageFocalY ?? 50,
    founding_year: details.foundingYear ?? null,
    team: emptyToNull(details.team),
    size: emptyToNull(details.size),
    problem: emptyToNull(details.problem),
    solution: emptyToNull(details.solution),
    target_market: emptyToNull(details.targetMarket),
    business_model: emptyToNull(details.businessModel),
    funding_goal: details.fundingGoal ?? null,
    amount_raised: details.amountRaised ?? null,
  };
}

async function removeStartupStoragePaths(
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

/** Clears `${startupId}/` (logo + cover + orphans) after the row is deleted. */
async function removeStartupStorageFolder(
  supabase: SupabaseServerClient,
  startupId: string,
) {
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list(startupId, { limit: 100 });

  if (error) {
    console.error("Failed to list startup storage folder", {
      bucket: MEDIA_BUCKET,
      startupId,
      error,
    });
    return;
  }

  await removeStartupStoragePaths(
    supabase,
    (data ?? []).map((object) => `${startupId}/${object.name}`),
  );
}

export async function createStartup(
  input: CreateStartupInput,
): Promise<StartupActionResult> {
  return runAdminMutation({
    schema: createStartupSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.createSuccess,
    },
    execute: async (session, data) => {
      const { data: rpcData, error } = await session.supabase.rpc(
        "create_startup_with_details",
        {
          p_core: toStartupCoreJson(data),
          // Cover uploads after create — never seed from a form URL string.
          p_details: toDetailsJson(data.details, null),
        },
      );

      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (error || !row?.id) {
        return { status: "error", message: rpcErrorMessage(error ?? {}) };
      }
      return { status: "success", id: row.id };
    },
    refresh: (data, id) => refreshStartupPaths(data.slug, id),
  });
}

export async function updateStartup(
  input: UpdateStartupInput,
): Promise<StartupActionResult> {
  return runAdminMutation({
    schema: updateStartupSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.updateSuccess,
    },
    execute: async (session, data) => {
      // Cover is owned by upload/remove — never let a form save wipe a Storage URL.
      const { data: existingDetails, error: coverLookupError } =
        await session.supabase
          .from("startup_details")
          .select("cover_image_url")
          .eq("startup_id", data.id)
          .maybeSingle();
      if (coverLookupError) {
        return { status: "error", message: MESSAGES.genericError };
      }

      const { data: rpcData, error } = await session.supabase.rpc(
        "update_startup_with_details",
        {
          p_id: data.id,
          p_core: toStartupCoreJson(data),
          p_details: toDetailsJson(
            data.details,
            existingDetails?.cover_image_url ?? null,
          ),
        },
      );

      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (error || !row?.id) {
        return { status: "error", message: rpcErrorMessage(error ?? {}) };
      }

      refreshStartupPaths(row.slug, row.id);
      if (row.previous_slug && row.previous_slug !== row.slug) {
        refreshStartupPaths(row.previous_slug, row.id);
      }

      return { status: "success", id: row.id };
    },
  });
}

export async function deleteStartup(
  input: DeleteStartupInput,
): Promise<StartupActionResult> {
  return runAdminMutation({
    schema: deleteStartupSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.deleteSuccess,
    },
    execute: async (session, data) => {
      const { data: existing, error: existingError } = await session.supabase
        .from("startups")
        .select("id, slug")
        .eq("id", data.id)
        .maybeSingle();

      if (existingError) {
        return { status: "error", message: MESSAGES.genericError };
      }
      if (!existing) {
        return { status: "error", message: MESSAGES.notFound };
      }

      const { error: deleteError } = await session.supabase
        .from("startups")
        .delete()
        .eq("id", data.id);

      if (deleteError) {
        return { status: "error", message: MESSAGES.genericError };
      }

      // Storage only after the row is gone: orphan objects beat a live row with
      // a deleted logo/cover URL.
      await removeStartupStorageFolder(session.supabase, data.id);

      refreshStartupPaths(existing.slug, data.id);
      return { status: "success" };
    },
  });
}

export async function uploadStartupLogo(
  startupId: string,
  formData: FormData,
): Promise<StartupActionResult> {
  if (!startupIdSchema.safeParse(startupId).success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: MESSAGES.invalidImage };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("startups")
    .select("id, slug, logo_url")
    .eq("id", startupId)
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
    entityId: startupId,
    preset: "startupLogo",
    previousUrl: existing.logo_url,
    maxBytes: MEDIA_MAX_BYTES,
    messages: MESSAGES,
    updateRow: async (publicUrl) =>
      session.supabase
        .from("startups")
        .update({ logo_url: publicUrl })
        .eq("id", startupId)
        .select("id")
        .maybeSingle(),
  });

  if (uploaded.status === "error") return uploaded;

  refreshStartupPaths(existing.slug, startupId);
  return {
    status: "success",
    message: MESSAGES.uploadSuccess,
    id: startupId,
  };
}

export async function removeStartupLogo(
  startupId: string,
): Promise<StartupActionResult> {
  if (!startupIdSchema.safeParse(startupId).success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("startups")
    .select("id, slug, logo_url")
    .eq("id", startupId)
    .maybeSingle();

  if (existingError) {
    return { status: "error", message: MESSAGES.genericError };
  }
  if (!existing) {
    return { status: "error", message: MESSAGES.notFound };
  }

  const { error: updateError } = await session.supabase
    .from("startups")
    .update({ logo_url: null })
    .eq("id", startupId);

  if (updateError) {
    return { status: "error", message: MESSAGES.genericError };
  }

  await removeOwnedPublicStorageObject(
    session.supabase,
    existing.logo_url,
    MEDIA_BUCKET,
  );

  refreshStartupPaths(existing.slug, startupId);
  return { status: "success", message: MESSAGES.removeSuccess, id: startupId };
}

export async function uploadStartupCover(
  startupId: string,
  formData: FormData,
): Promise<StartupActionResult> {
  if (!startupIdSchema.safeParse(startupId).success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: MESSAGES.invalidImage };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("startups")
    .select("id, slug")
    .eq("id", startupId)
    .maybeSingle();

  if (existingError) {
    return { status: "error", message: MESSAGES.genericError };
  }
  if (!existing) {
    return { status: "error", message: MESSAGES.notFound };
  }

  const { data: details, error: detailsError } = await session.supabase
    .from("startup_details")
    .select("cover_image_url")
    .eq("startup_id", startupId)
    .maybeSingle();

  if (detailsError) {
    return { status: "error", message: MESSAGES.genericError };
  }

  const uploaded = await uploadVersionedPublicImage({
    supabase: session.supabase,
    file,
    bucket: MEDIA_BUCKET,
    entityId: startupId,
    preset: "startupCover",
    previousUrl: details?.cover_image_url,
    maxBytes: MEDIA_MAX_BYTES,
    messages: MESSAGES,
    updateRow: async (publicUrl) =>
      session.supabase
        .from("startup_details")
        .update({ cover_image_url: publicUrl })
        .eq("startup_id", startupId)
        .select("startup_id")
        .maybeSingle()
        .then((result) => ({
          error: result.error,
          data: result.data ? { id: startupId } : null,
        })),
  });

  if (uploaded.status === "error") return uploaded;

  refreshStartupPaths(existing.slug, startupId);
  return {
    status: "success",
    message: MESSAGES.coverUploadSuccess,
    id: startupId,
  };
}

export async function removeStartupCover(
  startupId: string,
): Promise<StartupActionResult> {
  if (!startupIdSchema.safeParse(startupId).success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("startups")
    .select("id, slug")
    .eq("id", startupId)
    .maybeSingle();

  if (existingError) {
    return { status: "error", message: MESSAGES.genericError };
  }
  if (!existing) {
    return { status: "error", message: MESSAGES.notFound };
  }

  const { data: details, error: detailsError } = await session.supabase
    .from("startup_details")
    .select("cover_image_url")
    .eq("startup_id", startupId)
    .maybeSingle();

  if (detailsError) {
    return { status: "error", message: MESSAGES.genericError };
  }

  const { error: updateError } = await session.supabase
    .from("startup_details")
    .update({ cover_image_url: null })
    .eq("startup_id", startupId);

  if (updateError) {
    return { status: "error", message: MESSAGES.genericError };
  }

  await removeOwnedPublicStorageObject(
    session.supabase,
    details?.cover_image_url,
    MEDIA_BUCKET,
  );

  refreshStartupPaths(existing.slug, startupId);
  return {
    status: "success",
    message: MESSAGES.coverRemoveSuccess,
    id: startupId,
  };
}
