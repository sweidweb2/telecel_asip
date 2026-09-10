"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { BLOGS_CACHE_TAG } from "@/data/blogs";
import { STARTUPS_CACHE_TAG } from "@/data/startups";
import { authorizeEditor } from "@/lib/admin/authorize-editor";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  revalidateDashboardNavCounts,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { traceAsync } from "@/lib/admin/perf";
import {
  removeOwnedPublicStorageObject,
  uploadVersionedPublicImage,
} from "@/lib/media/upload-versioned-public-image";
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
  notFound: "Startup not found.",
  genericError: "Something went wrong. Please try again.",
  slugTaken: "That slug is already in use.",
  invalidImage: "Please upload a JPEG, PNG, WebP, or GIF under 5 MB.",
} as const;

const LOGO_BUCKET = "startups";
const LOGO_MAX_BYTES = 5 * 1024 * 1024;

function refreshStartupPaths(slug?: string, id?: string) {
  revalidateTag(STARTUPS_CACHE_TAG, "max");
  // Insights embed related startup names — bust blog cache on rename/link changes.
  revalidateTag(BLOGS_CACHE_TAG, "max");
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
  const isUnique =
    error.code === "23505" || message.includes("startups_slug");
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
) {
  return {
    website_url: emptyToNull(details.websiteUrl),
    industry: emptyToNull(details.industry),
    category: emptyToNull(details.category),
    location: emptyToNull(details.location),
    cohort: emptyToNull(details.cohort),
    country_code: emptyToNull(details.countryCode)?.toUpperCase() ?? null,
    sector: emptyToNull(details.sector),
    founder_names: (details.founderNames ?? "").split(",").map((name) => name.trim()).filter(Boolean),
    cover_image_url: emptyToNull(details.coverImageUrl),
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

export async function createStartup(
  input: CreateStartupInput,
): Promise<StartupActionResult> {
  const parsed = createStartupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase.rpc(
    "create_startup_with_details",
    {
      p_core: toStartupCoreJson(parsed.data),
      p_details: toDetailsJson(parsed.data.details),
    },
  );

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row?.id) {
    return { status: "error", message: rpcErrorMessage(error ?? {}) };
  }

  refreshStartupPaths(row.slug, row.id);
  return {
    status: "success",
    message: MESSAGES.createSuccess,
    id: row.id,
  };
}

export async function updateStartup(
  input: UpdateStartupInput,
): Promise<StartupActionResult> {
  const parsed = updateStartupSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase.rpc(
    "update_startup_with_details",
    {
      p_id: parsed.data.id,
      p_core: toStartupCoreJson(parsed.data),
      p_details: toDetailsJson(parsed.data.details),
    },
  );

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row?.id) {
    return { status: "error", message: rpcErrorMessage(error ?? {}) };
  }

  refreshStartupPaths(row.slug, row.id);
  if (row.previous_slug && row.previous_slug !== row.slug) {
    refreshStartupPaths(row.previous_slug, row.id);
  }

  return { status: "success", message: MESSAGES.updateSuccess, id: row.id };
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
        .select("id, slug, logo_url")
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

      // Storage only after the row is gone: a failure here leaks an orphan object
      // instead of leaving a live row pointing at a deleted logo.
      await removeOwnedPublicStorageObject(
        session.supabase,
        existing.logo_url,
        LOGO_BUCKET,
      );

      refreshStartupPaths(existing.slug, data.id);
      return { status: "success" };
    },
  });
}

export async function uploadStartupLogo(
  startupId: string,
  formData: FormData,
): Promise<StartupActionResult> {
  return traceAsync(
    "uploadStartupLogo",
    { eventType: "upload", cacheStatus: "n_a", meta: { startupId } },
    async () => {
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
        bucket: LOGO_BUCKET,
        entityId: startupId,
        preset: "startupLogo",
        previousUrl: existing.logo_url,
        maxBytes: LOGO_MAX_BYTES,
        messages: MESSAGES,
        updateRow: async (publicUrl) =>
          session.supabase
            .from("startups")
            .update({ logo_url: publicUrl })
            .eq("id", startupId),
      });

      if (uploaded.status === "error") return uploaded;

      refreshStartupPaths(existing.slug, startupId);
      return {
        status: "success",
        message: MESSAGES.uploadSuccess,
        id: startupId,
      };
    },
  );
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
    LOGO_BUCKET,
  );

  refreshStartupPaths(existing.slug, startupId);
  return { status: "success", message: MESSAGES.removeSuccess, id: startupId };
}
