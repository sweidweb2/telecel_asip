import { nanoid } from "nanoid";

import {
  processImageBuffer,
  type ImagePreset,
} from "@/lib/media/process-image";
import {
  publicObjectUrl,
  storagePathFromPublicUrl,
} from "@/lib/storage/public-url";
import type { createClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createClient>>;

/** Long TTL for immutable versioned public media paths. */
export const PUBLIC_MEDIA_CACHE_CONTROL = "31536000";

export const ADMIN_IMAGE_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type UploadVersionedPublicImageMessages = {
  invalidImage: string;
  genericError: string;
};

export type UploadVersionedPublicImageResult =
  | { status: "success"; publicUrl: string; path: string }
  | { status: "error"; message: string };

/**
 * Best-effort delete of a public object owned by `bucket`. Logs and continues
 * when Storage remove fails so the DB remains the source of truth.
 */
export async function removeOwnedPublicStorageObject(
  supabase: ServerClient,
  url: string | null | undefined,
  bucket: string,
): Promise<void> {
  const path = storagePathFromPublicUrl(url, bucket);
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error("Failed to remove storage object", { bucket, path, error });
  }
}

/**
 * CDN-safe replace: process → versioned path (`entityId/nanoid.ext`) →
 * `upsert: false` + long cacheControl → DB update → delete previous object.
 * Rolls back the new object if the DB update fails.
 */
export async function uploadVersionedPublicImage(options: {
  supabase: ServerClient;
  file: File;
  bucket: string;
  entityId: string;
  preset: ImagePreset;
  previousUrl: string | null | undefined;
  maxBytes: number;
  messages: UploadVersionedPublicImageMessages;
  updateRow: (publicUrl: string) => Promise<{
    error: { message?: string } | null;
    /** When provided, null/undefined means the UPDATE matched zero rows. */
    data?: { id: string } | null;
  }>;
  allowedMime?: Set<string>;
  cacheControl?: string;
}): Promise<UploadVersionedPublicImageResult> {
  const {
    supabase,
    file,
    bucket,
    entityId,
    preset,
    previousUrl,
    maxBytes,
    messages,
    updateRow,
    allowedMime = ADMIN_IMAGE_ALLOWED_MIME,
    cacheControl = PUBLIC_MEDIA_CACHE_CONTROL,
  } = options;

  if (
    !allowedMime.has(file.type) ||
    file.size <= 0 ||
    file.size > maxBytes
  ) {
    return { status: "error", message: messages.invalidImage };
  }

  let processed;
  try {
    processed = await processImageBuffer(
      Buffer.from(await file.arrayBuffer()),
      preset,
    );
  } catch {
    return { status: "error", message: messages.invalidImage };
  }

  const path = `${entityId}/${nanoid(10)}.${processed.extension}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, processed.buffer, {
      contentType: processed.contentType,
      upsert: false,
      cacheControl,
    });

  if (uploadError) {
    return { status: "error", message: messages.genericError };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    const { error: rollbackError } = await supabase.storage
      .from(bucket)
      .remove([path]);
    if (rollbackError) {
      console.error("Failed to roll back uploaded object", {
        bucket,
        path,
        error: rollbackError,
      });
    }
    return { status: "error", message: messages.genericError };
  }

  const publicUrl = publicObjectUrl(supabaseUrl, bucket, path);

  let updateError: { message?: string } | null = null;
  let updated: { id: string } | null | undefined;
  try {
    const result = await updateRow(publicUrl);
    updateError = result.error;
    updated = result.data;
  } catch (err) {
    console.error("DB update threw during media upload", { bucket, path, err });
    updateError = { message: "update threw" };
    updated = null;
  }

  if (updateError || updated === null) {
    const { error: rollbackError } = await supabase.storage
      .from(bucket)
      .remove([path]);
    if (rollbackError) {
      console.error("Failed to roll back uploaded object", {
        bucket,
        path,
        error: rollbackError,
      });
    }
    return { status: "error", message: messages.genericError };
  }

  await removeOwnedPublicStorageObject(supabase, previousUrl, bucket);
  return { status: "success", publicUrl, path };
}
