"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { nanoid } from "nanoid";

import { ROUTES } from "@/constants/routes";
import { STARTUPS_CACHE_TAG } from "@/data/startups";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { processImageBuffer } from "@/lib/media/process-image";
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
  notFound: "Startup not found.",
  genericError: "Something went wrong. Please try again.",
  slugTaken: "That slug is already in use.",
  invalidImage: "Please upload a JPEG, PNG, WebP, or GIF under 5 MB.",
} as const;

const LOGO_BUCKET = "startups";
const LOGO_MAX_BYTES = 5 * 1024 * 1024;
const LOGO_CACHE_CONTROL = "31536000";
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function refreshStartupPaths(slug?: string) {
  revalidateTag(STARTUPS_CACHE_TAG, "max");
  revalidatePath(ROUTES.portfolio);
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

  const session = await authorizeAdmin(MESSAGES);
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

  refreshStartupPaths(row.slug);
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

  const session = await authorizeAdmin(MESSAGES);
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

  refreshStartupPaths(row.slug);
  if (row.previous_slug && row.previous_slug !== row.slug) {
    refreshStartupPaths(row.previous_slug);
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
      await removeStorageUrlIfOwned(session.supabase, existing.logo_url);

      refreshStartupPaths(existing.slug);
      return { status: "success" };
    },
  });
}

function publicObjectUrl(supabaseUrl: string, bucket: string, path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

function storagePathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${LOGO_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

async function removeStorageUrlIfOwned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url: string | null | undefined,
) {
  const path = storagePathFromPublicUrl(url);
  if (!path) return;
  const { error } = await supabase.storage.from(LOGO_BUCKET).remove([path]);
  if (error) {
    // Orphaned object — the DB is already consistent, so surface it for cleanup
    // rather than failing the action.
    console.error("Failed to remove storage object", {
      bucket: LOGO_BUCKET,
      path,
      error,
    });
  }
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

  if (!ALLOWED_MIME.has(file.type) || file.size <= 0 || file.size > LOGO_MAX_BYTES) {
    return { status: "error", message: MESSAGES.invalidImage };
  }

  const session = await authorizeAdmin(MESSAGES);
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

  let processed;
  try {
    processed = await processImageBuffer(
      Buffer.from(await file.arrayBuffer()),
      "startupLogo",
    );
  } catch {
    return { status: "error", message: MESSAGES.invalidImage };
  }

  const path = `${startupId}/${nanoid(10)}.${processed.extension}`;

  const { error: uploadError } = await session.supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, processed.buffer, {
      contentType: processed.contentType,
      upsert: false,
      cacheControl: LOGO_CACHE_CONTROL,
    });

  if (uploadError) {
    return { status: "error", message: MESSAGES.genericError };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return { status: "error", message: MESSAGES.genericError };
  }

  const publicUrl = publicObjectUrl(supabaseUrl, LOGO_BUCKET, path);
  const { error: updateError } = await session.supabase
    .from("startups")
    .update({ logo_url: publicUrl })
    .eq("id", startupId);

  if (updateError) {
    await session.supabase.storage.from(LOGO_BUCKET).remove([path]);
    return { status: "error", message: MESSAGES.genericError };
  }

  await removeStorageUrlIfOwned(session.supabase, existing.logo_url);
  refreshStartupPaths(existing.slug);
  return { status: "success", message: MESSAGES.uploadSuccess, id: startupId };
}

export async function removeStartupLogo(
  startupId: string,
): Promise<StartupActionResult> {
  if (!startupIdSchema.safeParse(startupId).success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeAdmin(MESSAGES);
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

  await removeStorageUrlIfOwned(session.supabase, existing.logo_url);

  refreshStartupPaths(existing.slug);
  return { status: "success", message: MESSAGES.removeSuccess, id: startupId };
}
