"use server";

import { revalidatePath } from "next/cache";

import { getAdminResource } from "@/constants/admin-resources";
import { UPLOAD_MAX_BYTES } from "@/constants/upload";
import { authorizeEditor } from "@/lib/admin/authorize-editor";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import {
  refreshAdminResource,
  runAdminMutation,
} from "@/lib/admin/run-admin-mutation";
import {
  removeOwnedPublicStorageObject,
  uploadVersionedPublicImage,
} from "@/lib/media/upload-versioned-public-image";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionResult } from "@/types/admin-action";
import { writeAdminRow } from "@/lib/admin/write-admin-row";
import {
  createFounderStorySchema,
  deleteFounderStorySchema,
  founderStoryIdSchema,
  updateFounderStorySchema,
  type CreateFounderStoryInput,
  type DeleteFounderStoryInput,
  type UpdateFounderStoryInput,
} from "@/validations/founder-story";

export type FounderStoryActionResult = AdminActionResult;

const resource = getAdminResource("founderStories");

const COVER_BUCKET = "founder-stories";
const COVER_MAX_BYTES = UPLOAD_MAX_BYTES;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const MESSAGES = {
  unauthorized: "You do not have permission to manage founder stories.",
  signedInRequired: "You must be signed in.",
  invalidDetails: "Please check the form and try again.",
  createSuccess: "Founder story created successfully.",
  updateSuccess: "Founder story updated successfully.",
  deleteSuccess: "Founder story deleted successfully.",
  uploadSuccess: "Cover image uploaded successfully.",
  removeSuccess: "Cover image removed successfully.",
  notFound: "Founder story not found.",
  duplicateStartup: "This startup already has a founder story.",
  genericError: "Something went wrong. Please try again.",
  invalidImage: "Please upload a JPEG, PNG, WebP, or GIF under 10 MB.",
} as const;

const PG_MESSAGES = {
  unauthorized: MESSAGES.unauthorized,
  notFound: MESSAGES.notFound,
  genericError: MESSAGES.genericError,
  uniqueViolation: MESSAGES.duplicateStartup,
  uniqueConstraint: "founder_stories_startup_id",
};

function refreshFounderStoryPaths(id?: string) {
  refreshAdminResource({
    listPath: resource.listPath,
    detailPath: id ? `${resource.listPath}/${id}` : undefined,
    cacheTags: resource.cacheTags,
  });
  // Profile HTML varies by slug. Invalidate the page file, not the founders layout.
  revalidatePath("/en/founders");
  revalidatePath("/fr/founders");
  revalidatePath("/en/founders/[slug]", "page");
  revalidatePath("/fr/founders/[slug]", "page");
  revalidatePath("/en/impact");
  revalidatePath("/fr/impact");
}

function normalizePermission(
  value: CreateFounderStoryInput["quotePermissionStatus"],
): "granted" | "pending" | "denied" | null {
  if (value === "" || value === null || value === undefined) return null;
  return value;
}

function toFounderStoryRow(
  input: CreateFounderStoryInput | UpdateFounderStoryInput,
  coverImageUrl?: string | null,
) {
  const quoteText = emptyToNull(input.founderQuoteText);
  const hasQuote = Boolean(quoteText);

  return {
    startup_id: input.startupId,
    story_title: input.storyTitle,
    cover_image_url:
      coverImageUrl !== undefined
        ? emptyToNull(coverImageUrl)
        : emptyToNull(input.coverImageUrl),
    headline_stat: emptyToNull(input.headlineStat),
    the_problem: input.theProblem,
    what_they_built: input.whatTheyBuilt,
    the_asip_connection: input.theAsipConnection,
    where_they_are_now: input.whereTheyAreNow,
    founder_quote_text: quoteText,
    quote_attribution_name: hasQuote
      ? emptyToNull(input.quoteAttributionName)
      : null,
    quote_attribution_title: hasQuote
      ? emptyToNull(input.quoteAttributionTitle)
      : null,
    quote_date: hasQuote ? emptyToNull(input.quoteDate) : null,
    quote_permission_status: hasQuote
      ? normalizePermission(input.quotePermissionStatus)
      : null,
    publish_status: input.publishStatus,
  };
}

async function removeFounderStoryStoragePaths(
  supabase: SupabaseServerClient,
  paths: string[],
) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(COVER_BUCKET).remove(paths);
  if (error) {
    console.error("Failed to remove storage objects", {
      bucket: COVER_BUCKET,
      paths,
      error,
    });
  }
}

async function removeFounderStoryStorageFolder(
  supabase: SupabaseServerClient,
  storyId: string,
) {
  const { data, error } = await supabase.storage
    .from(COVER_BUCKET)
    .list(storyId, { limit: 100 });

  if (error) {
    console.error("Failed to list founder story storage folder", {
      bucket: COVER_BUCKET,
      storyId,
      error,
    });
    return;
  }

  await removeFounderStoryStoragePaths(
    supabase,
    (data ?? []).map((object) => `${storyId}/${object.name}`),
  );
}

export async function createFounderStory(
  input: CreateFounderStoryInput,
): Promise<FounderStoryActionResult> {
  return runAdminMutation({
    schema: createFounderStorySchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.createSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: (session, data) =>
      writeAdminRow(session.supabase, {
        op: "insert",
        table: "founder_stories",
        // Cover uploads after create — never seed from a form URL string.
        values: toFounderStoryRow(data, null),
      }),
    refresh: (_data, id) => refreshFounderStoryPaths(id),
  });
}

export async function updateFounderStory(
  input: UpdateFounderStoryInput,
): Promise<FounderStoryActionResult> {
  return runAdminMutation({
    schema: updateFounderStorySchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.updateSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      // Cover is owned by upload/remove — never let a form save wipe a Storage URL.
      const { data: existing, error: coverLookupError } = await session.supabase
        .from("founder_stories")
        .select("cover_image_url")
        .eq("id", data.id)
        .maybeSingle();
      if (coverLookupError) {
        return { status: "error", message: MESSAGES.genericError };
      }

      return writeAdminRow(session.supabase, {
        op: "update",
        table: "founder_stories",
        id: data.id,
        values: toFounderStoryRow(data, existing?.cover_image_url ?? null),
        notFound: MESSAGES.notFound,
      });
    },
    refresh: (_data, id) => refreshFounderStoryPaths(id),
  });
}

export async function deleteFounderStory(
  input: DeleteFounderStoryInput,
): Promise<FounderStoryActionResult> {
  return runAdminMutation({
    schema: deleteFounderStorySchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.deleteSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      const deleted = await writeAdminRow(session.supabase, {
        op: "delete",
        table: "founder_stories",
        id: data.id,
        notFound: MESSAGES.notFound,
      });
      if (deleted.status === "error") return deleted;

      await removeFounderStoryStorageFolder(session.supabase, data.id);
      return deleted;
    },
    refresh: (data) => refreshFounderStoryPaths(data.id),
  });
}

export async function uploadFounderStoryCover(
  storyId: string,
  formData: FormData,
): Promise<FounderStoryActionResult> {
  if (!founderStoryIdSchema.safeParse(storyId).success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: MESSAGES.invalidImage };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("founder_stories")
    .select("id, cover_image_url")
    .eq("id", storyId)
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
    bucket: COVER_BUCKET,
    entityId: storyId,
    preset: "founderStoryCover",
    previousUrl: existing.cover_image_url,
    maxBytes: COVER_MAX_BYTES,
    messages: MESSAGES,
    updateRow: async (publicUrl) =>
      session.supabase
        .from("founder_stories")
        .update({ cover_image_url: publicUrl })
        .eq("id", storyId)
        .select("id")
        .maybeSingle(),
  });

  if (uploaded.status === "error") return uploaded;

  refreshFounderStoryPaths(storyId);
  return {
    status: "success",
    message: MESSAGES.uploadSuccess,
    id: storyId,
  };
}

export async function removeFounderStoryCover(
  storyId: string,
): Promise<FounderStoryActionResult> {
  if (!founderStoryIdSchema.safeParse(storyId).success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("founder_stories")
    .select("id, cover_image_url")
    .eq("id", storyId)
    .maybeSingle();

  if (existingError) {
    return { status: "error", message: MESSAGES.genericError };
  }
  if (!existing) {
    return { status: "error", message: MESSAGES.notFound };
  }

  const { error: updateError } = await session.supabase
    .from("founder_stories")
    .update({ cover_image_url: null })
    .eq("id", storyId);

  if (updateError) {
    return { status: "error", message: MESSAGES.genericError };
  }

  await removeOwnedPublicStorageObject(
    session.supabase,
    existing.cover_image_url,
    COVER_BUCKET,
  );

  refreshFounderStoryPaths(storyId);
  return { status: "success", message: MESSAGES.removeSuccess, id: storyId };
}
