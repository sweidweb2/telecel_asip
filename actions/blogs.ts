"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { UPLOAD_MAX_BYTES } from "@/constants/upload";
import { BLOGS_CACHE_TAG } from "@/data/blogs";
import { estimateReadingTimeMinutes } from "@/lib/blog-utils";
import { authorizeEditor } from "@/lib/admin/authorize-editor";
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
import { sanitizeBlogHtml } from "@/lib/sanitize-html";
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
  invalidImage: "Please upload a JPEG, PNG, WebP, or GIF under 10 MB.",
} as const;

const COVER_BUCKET = "blogs";
const AUTHOR_BUCKET = "auther";
const COVER_MAX_BYTES = UPLOAD_MAX_BYTES;
const AUTHOR_MAX_BYTES = UPLOAD_MAX_BYTES;

function refreshBlogPaths(slug?: string, id?: string) {
  revalidateTag(BLOGS_CACHE_TAG, "max");
  revalidateDashboardNavCounts();
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
  return runAdminMutation({
    schema: createBlogSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.createSuccess,
    },
    perfName: "createBlog",
    execute: async (session, data) => {
      const { data: rpcData, error } = await session.supabase.rpc(
        "create_blog_with_featured",
        { p_blog: toBlogJson(data) },
      );

      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (error || !row?.id) {
        return { status: "error", message: rpcErrorMessage(error ?? {}) };
      }
      return { status: "success", id: row.id };
    },
    refresh: (data, id) => refreshBlogPaths(data.slug, id),
  });
}

export async function updateBlog(
  input: UpdateBlogInput,
): Promise<BlogActionResult> {
  let publishedSlug: string | undefined;
  let previousSlug: string | null | undefined;

  return runAdminMutation({
    schema: updateBlogSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.updateSuccess,
    },
    perfName: "updateBlog",
    execute: async (session, data) => {
      const { id, ...rest } = data;

      const { data: rpcData, error } = await session.supabase.rpc(
        "update_blog_with_featured",
        { p_id: id, p_blog: toBlogJson(rest) },
      );

      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (error || !row?.id) {
        return { status: "error", message: rpcErrorMessage(error ?? {}) };
      }

      publishedSlug = row.slug;
      previousSlug = row.previous_slug;
      return { status: "success", id: row.id };
    },
    refresh: (_data, id) => {
      refreshBlogPaths(publishedSlug, id);
      if (previousSlug && previousSlug !== publishedSlug) {
        refreshBlogPaths(previousSlug, id);
      }
    },
  });
}

export async function updateBlogStatus(
  input: UpdateBlogStatusInput,
): Promise<BlogActionResult> {
  let slug: string | undefined;
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

      slug = row.slug;
      return { status: "success", id: row.id };
    },
    refresh: (_data, id) => refreshBlogPaths(slug, id),
  });
}

export async function deleteBlog(
  input: DeleteBlogInput,
): Promise<BlogActionResult> {
  let slug: string | undefined;
  let deletedId: string | undefined;

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
      await removeOwnedPublicStorageObject(
        session.supabase,
        existing.thumbnail_url,
        COVER_BUCKET,
      );
      await removeOwnedPublicStorageObject(
        session.supabase,
        existing.author_avatar_url,
        AUTHOR_BUCKET,
      );

      slug = existing.slug;
      deletedId = existing.id;
      return { status: "success" };
    },
    refresh: () => refreshBlogPaths(slug, deletedId),
  });
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

      const previousUrl =
        column === "thumbnail_url"
          ? existing.thumbnail_url
          : existing.author_avatar_url;

      const uploaded = await uploadVersionedPublicImage({
        supabase: session.supabase,
        file,
        bucket,
        entityId: blogId,
        preset: column === "thumbnail_url" ? "blogCover" : "blogAvatar",
        previousUrl,
        maxBytes,
        messages: MESSAGES,
        updateRow: async (publicUrl) =>
          column === "thumbnail_url"
            ? session.supabase
                .from("blogs")
                .update({ thumbnail_url: publicUrl })
                .eq("id", blogId)
            : session.supabase
                .from("blogs")
                .update({ author_avatar_url: publicUrl })
                .eq("id", blogId),
      });

      if (uploaded.status === "error") return uploaded;

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

  await removeOwnedPublicStorageObject(session.supabase, url, bucket);

  refreshBlogPaths(existing.slug, parsed.data.id);
  return {
    status: "success",
    message: MESSAGES.removeSuccess,
    id: parsed.data.id,
  };
}
