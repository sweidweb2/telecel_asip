"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { nanoid } from "nanoid";

import { ROUTES } from "@/constants/routes";
import { BLOGS_CACHE_TAG } from "@/data/blogs";
import { getCohortsForBlogPicker } from "@/data/cohorts";
import { getStartupsForBlogPicker } from "@/data/startups";
import { estimateReadingTimeMinutes } from "@/lib/blog-utils";
import { authorizeEditor } from "@/lib/admin/authorize-editor";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { traceAsync } from "@/lib/admin/perf";
import { processImageBuffer } from "@/lib/media/process-image";
import { sanitizeBlogHtml } from "@/lib/sanitize-html";
import { createClient } from "@/lib/supabase/server";
import {
  blogIdSchema,
  blogImageTargetSchema,
  createBlogSchema,
  deleteBlogSchema,
  updateBlogSchema,
  updateBlogStatusSchema,
  type BlogImageTarget,
  type CreateBlogInput,
  type DeleteBlogInput,
  type UpdateBlogInput,
  type UpdateBlogStatusInput,
} from "@/validations/blog";

export type BlogActionResult = AdminActionResult;

const MESSAGES = {
  unauthorized: "You do not have permission to manage blogs.",
  signedInRequired: "You must be signed in.",
  invalidDetails: "Please check the form and try again.",
  createSuccess: "Blog created successfully.",
  updateSuccess: "Blog updated successfully.",
  publishSuccess: "Blog published.",
  draftSuccess: "Blog moved to draft.",
  deleteSuccess: "Blog deleted successfully.",
  uploadSuccess: "Image uploaded successfully.",
  removeSuccess: "Image removed successfully.",
  notFound: "Blog not found.",
  genericError: "Something went wrong. Please try again.",
  slugTaken: "That slug is already in use.",
  featuredTaken: "Another post is already featured. Unfeature it first, or save again.",
  invalidImage: "Please upload a JPEG, PNG, WebP, or GIF under the size limit.",
} as const;

/** Lazy searchable options for blog related-founder / cohort selects. */
export async function loadBlogLinkOptions(input?: {
  /** Shared search applied to both lists when specific searches are omitted. */
  search?: string;
  startupSearch?: string;
  cohortSearch?: string;
  includeStartupId?: string | null;
  includeCohortId?: string | null;
}): Promise<
  | {
      status: "ok";
      startups: { id: string; name: string }[];
      cohorts: { id: string; label: string }[];
    }
  | { status: "error"; message: string }
> {
  const shared = input?.search ?? "";
  const startupSearch = input?.startupSearch ?? shared;
  const cohortSearch = input?.cohortSearch ?? shared;
  const [startupsResult, cohortsResult] = await Promise.all([
    getStartupsForBlogPicker(startupSearch, input?.includeStartupId),
    getCohortsForBlogPicker(cohortSearch, input?.includeCohortId),
  ]);
  if (
    startupsResult.status === "forbidden" ||
    cohortsResult.status === "forbidden"
  ) {
    return { status: "error", message: MESSAGES.unauthorized };
  }
  return {
    status: "ok",
    startups: startupsResult.startups,
    cohorts: cohortsResult.cohorts,
  };
}

const COVER_BUCKET = "blogs";
const AUTHOR_BUCKET = "auther";
const COVER_MAX_BYTES = 5 * 1024 * 1024;
const AUTHOR_MAX_BYTES = 2 * 1024 * 1024;
const MEDIA_CACHE_CONTROL = "31536000";
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function refreshBlogPaths(slug?: string, id?: string) {
  revalidateTag(BLOGS_CACHE_TAG, "max");
  revalidatePath(ROUTES.blogs);
  if (id) {
    revalidatePath(`${ROUTES.blogs}/${id}`);
  }
  revalidatePath("/en/insights");
  revalidatePath("/fr/insights");
  if (slug) {
    revalidatePath(`/en/insights/${slug}`);
    revalidatePath(`/fr/insights/${slug}`);
  }
}

function uniqueConstraintMessage(error: {
  code?: string;
  message?: string;
}): string | null {
  const message = (error.message ?? "").toLowerCase();
  const isUnique =
    error.code === "23505" ||
    message.includes("blogs_slug") ||
    message.includes("blogs_one_featured");
  if (!isUnique) return null;
  if (message.includes("blogs_one_featured")) return MESSAGES.featuredTaken;
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

/**
 * Row payload for the write RPCs. Sanitization and reading-time estimation stay
 * here; the RPC owns featured exclusivity and `published_at`.
 */
function toBlogJson(input: CreateBlogInput) {
  const bodyHtml = sanitizeBlogHtml(input.bodyHtml);
  return {
    title: input.title,
    slug: input.slug,
    summary: input.summary,
    body_html: bodyHtml,
    categories: input.categories,
    author_name: input.authorName,
    status: input.status,
    is_featured: input.isFeatured,
    reading_time_minutes: estimateReadingTimeMinutes(bodyHtml),
    startup_id: input.startupId,
    cohort_id: input.cohortId,
    sources: input.sources,
    meta_title: input.metaTitle,
    meta_description: input.metaDescription,
  };
}

export async function createBlog(
  input: CreateBlogInput,
): Promise<BlogActionResult> {
  const parsed = createBlogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase.rpc(
    "create_blog_with_featured",
    { p_blog: toBlogJson(parsed.data) },
  );

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row?.id) {
    return { status: "error", message: rpcErrorMessage(error ?? {}) };
  }

  refreshBlogPaths(row.slug, row.id);
  return {
    status: "success",
    message: MESSAGES.createSuccess,
    id: row.id,
  };
}

export async function updateBlog(
  input: UpdateBlogInput,
): Promise<BlogActionResult> {
  const parsed = updateBlogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const { id, ...rest } = parsed.data;

  const { data, error } = await session.supabase.rpc(
    "update_blog_with_featured",
    { p_id: id, p_blog: toBlogJson(rest) },
  );

  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row?.id) {
    return { status: "error", message: rpcErrorMessage(error ?? {}) };
  }

  refreshBlogPaths(row.slug, row.id);
  if (row.previous_slug && row.previous_slug !== row.slug) {
    refreshBlogPaths(row.previous_slug, row.id);
  }

  return { status: "success", message: MESSAGES.updateSuccess, id: row.id };
}

export async function updateBlogStatus(
  input: UpdateBlogStatusInput,
): Promise<BlogActionResult> {
  const successMessage =
    input.status === "published"
      ? MESSAGES.publishSuccess
      : MESSAGES.draftSuccess;

  return runAdminMutation({
    schema: updateBlogStatusSchema,
    input,
    messages: {
      ...MESSAGES,
      success: successMessage,
    },
    perfName: "updateBlogStatus",
    execute: async (session, data) => {
      const { data: existing } = await session.supabase
        .from("blogs")
        .select("id, slug, published_at, is_featured")
        .eq("id", data.id)
        .maybeSingle();

      if (!existing) {
        return { status: "error", message: MESSAGES.notFound };
      }

      const publishedAt =
        data.status === "published"
          ? (existing.published_at ?? new Date().toISOString())
          : existing.published_at;

      const { data: row, error } = await session.supabase
        .from("blogs")
        .update({
          status: data.status,
          is_featured: data.status === "draft" ? false : existing.is_featured,
          published_at: publishedAt,
        })
        .eq("id", data.id)
        .select("id, slug")
        .maybeSingle();

      if (error) {
        return { status: "error", message: MESSAGES.genericError };
      }
      if (!row) {
        return { status: "error", message: MESSAGES.notFound };
      }

      refreshBlogPaths(row.slug, row.id);
      return { status: "success", id: row.id };
    },
  });
}

export async function deleteBlog(
  input: DeleteBlogInput,
): Promise<BlogActionResult> {
  return runAdminMutation({
    schema: deleteBlogSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.deleteSuccess,
    },
    execute: async (session, data) => {
      const { data: existing } = await session.supabase
        .from("blogs")
        .select("id, slug, thumbnail_url, author_avatar_url")
        .eq("id", data.id)
        .maybeSingle();

      if (!existing) {
        return { status: "error", message: MESSAGES.notFound };
      }

      const { error } = await session.supabase
        .from("blogs")
        .delete()
        .eq("id", data.id);

      if (error) {
        return { status: "error", message: MESSAGES.genericError };
      }

      // Storage only after the row is gone: a failure here leaks an orphan object
      // instead of leaving a live row pointing at a deleted image.
      await removeStorageUrlIfOwned(
        session.supabase,
        existing.thumbnail_url,
        COVER_BUCKET,
      );
      await removeStorageUrlIfOwned(
        session.supabase,
        existing.author_avatar_url,
        AUTHOR_BUCKET,
      );

      refreshBlogPaths(existing.slug, existing.id);
      return { status: "success" };
    },
  });
}

function publicObjectUrl(supabaseUrl: string, bucket: string, path: string) {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

function storagePathFromPublicUrl(
  url: string | null | undefined,
  bucket: string,
): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

async function removeStorageUrlIfOwned(
  supabase: Awaited<ReturnType<typeof createClient>>,
  url: string | null | undefined,
  bucket: string,
) {
  const path = storagePathFromPublicUrl(url, bucket);
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    // Orphaned object — the DB is already consistent, so surface it for cleanup
    // rather than failing the action.
    console.error("Failed to remove storage object", { bucket, path, error });
  }
}

async function uploadImage(options: {
  blogId: string;
  file: File;
  bucket: typeof COVER_BUCKET | typeof AUTHOR_BUCKET;
  column: "thumbnail_url" | "author_avatar_url";
  maxBytes: number;
}): Promise<BlogActionResult> {
  const { blogId, file, bucket, column, maxBytes } = options;

  return traceAsync(
    column === "thumbnail_url" ? "uploadBlogThumbnail" : "uploadAuthorAvatar",
    {
      eventType: "upload",
      cacheStatus: "n_a",
      meta: { column, bucket, bytes: file.size },
    },
    async () => {
      const parsedId = blogIdSchema.safeParse(blogId);
      if (!parsedId.success) {
        return { status: "error", message: MESSAGES.invalidDetails };
      }

      if (
        !ALLOWED_MIME.has(file.type) ||
        file.size <= 0 ||
        file.size > maxBytes
      ) {
        return { status: "error", message: MESSAGES.invalidImage };
      }

      const session = await authorizeEditor(MESSAGES);
      if (session.status === "error") return session;

      const { data: existing, error: existingError } = await session.supabase
        .from("blogs")
        .select("id, slug, thumbnail_url, author_avatar_url")
        .eq("id", blogId)
        .maybeSingle();

      if (existingError) {
        return { status: "error", message: MESSAGES.genericError };
      }
      if (!existing) {
        return { status: "error", message: MESSAGES.notFound };
      }

      const preset = column === "thumbnail_url" ? "blogCover" : "blogAvatar";
      let processed;
      try {
        processed = await processImageBuffer(
          Buffer.from(await file.arrayBuffer()),
          preset,
        );
      } catch {
        return { status: "error", message: MESSAGES.invalidImage };
      }

      const path = `${blogId}/${nanoid(10)}.${processed.extension}`;

      const { error: uploadError } = await session.supabase.storage
        .from(bucket)
        .upload(path, processed.buffer, {
          contentType: processed.contentType,
          upsert: false,
          cacheControl: MEDIA_CACHE_CONTROL,
        });

      if (uploadError) {
        return { status: "error", message: MESSAGES.genericError };
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        return { status: "error", message: MESSAGES.genericError };
      }

      const publicUrl = publicObjectUrl(supabaseUrl, bucket, path);
      const previousUrl =
        column === "thumbnail_url"
          ? (existing as { thumbnail_url: string | null }).thumbnail_url
          : (existing as { author_avatar_url: string | null }).author_avatar_url;

      const { error: updateError } =
        column === "thumbnail_url"
          ? await session.supabase
              .from("blogs")
              .update({ thumbnail_url: publicUrl })
              .eq("id", blogId)
          : await session.supabase
              .from("blogs")
              .update({ author_avatar_url: publicUrl })
              .eq("id", blogId);

      if (updateError) {
        await session.supabase.storage.from(bucket).remove([path]);
        return { status: "error", message: MESSAGES.genericError };
      }

      await removeStorageUrlIfOwned(session.supabase, previousUrl, bucket);
      refreshBlogPaths(existing.slug, blogId);
      return { status: "success", message: MESSAGES.uploadSuccess, id: blogId };
    },
  );
}

export async function uploadBlogThumbnail(
  blogId: string,
  formData: FormData,
): Promise<BlogActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: MESSAGES.invalidImage };
  }
  return uploadImage({
    blogId,
    file,
    bucket: COVER_BUCKET,
    column: "thumbnail_url",
    maxBytes: COVER_MAX_BYTES,
  });
}

export async function uploadAuthorAvatar(
  blogId: string,
  formData: FormData,
): Promise<BlogActionResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: MESSAGES.invalidImage };
  }
  return uploadImage({
    blogId,
    file,
    bucket: AUTHOR_BUCKET,
    column: "author_avatar_url",
    maxBytes: AUTHOR_MAX_BYTES,
  });
}

export async function removeBlogImage(
  input: BlogImageTarget,
): Promise<BlogActionResult> {
  const parsed = blogImageTargetSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeEditor(MESSAGES);
  if (session.status === "error") return session;

  const bucket = parsed.data.kind === "thumbnail" ? COVER_BUCKET : AUTHOR_BUCKET;

  const { data: existing, error: existingError } = await session.supabase
    .from("blogs")
    .select("id, slug, thumbnail_url, author_avatar_url")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (existingError) {
    return { status: "error", message: MESSAGES.genericError };
  }
  if (!existing) {
    return { status: "error", message: MESSAGES.notFound };
  }

  const url =
    parsed.data.kind === "thumbnail"
      ? existing.thumbnail_url
      : existing.author_avatar_url;

  const { error } =
    parsed.data.kind === "thumbnail"
      ? await session.supabase
          .from("blogs")
          .update({ thumbnail_url: null })
          .eq("id", parsed.data.id)
      : await session.supabase
          .from("blogs")
          .update({ author_avatar_url: null })
          .eq("id", parsed.data.id);

  if (error) {
    return { status: "error", message: MESSAGES.genericError };
  }

  await removeStorageUrlIfOwned(session.supabase, url, bucket);

  refreshBlogPaths(existing.slug, parsed.data.id);
  return {
    status: "success",
    message: MESSAGES.removeSuccess,
    id: parsed.data.id,
  };
}
