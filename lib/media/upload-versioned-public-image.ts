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

type MediaUrlCasQuery = {
  eq: (column: string, value: string) => MediaUrlCasQuery;
  is: (column: string, value: null) => MediaUrlCasQuery;
};

type MediaUrlUpdateQuery = MediaUrlCasQuery & {
  select: (columns: string) => {
    maybeSingle: () => PromiseLike<{
      data: unknown;
      error: { message?: string } | null;
    }>;
  };
};

/**
 * Optimistic concurrency for media replaces: only match the row when the
 * media column still equals the URL we read before upload (or is still null).
 * A concurrent replace makes the UPDATE match zero rows so the new object
 * is rolled back instead of orphaning the winner.
 */
export function withMediaUrlCas<T extends MediaUrlCasQuery>(
  query: T,
  column: string,
  previousUrl: string | null | undefined,
): T {
  if (previousUrl) {
    return query.eq(column, previousUrl) as T;
  }
  return query.is(column, null) as T;
}

/**
 * DB step for media replace — CAS is applied here so call sites cannot skip it.
 * Pass `.update({ [column]: url }).eq(...)` via `prepareUpdate`; do not CAS yourself.
 */
export type PersistMediaUrl = {
  column: string;
  prepareUpdate: (publicUrl: string) => MediaUrlUpdateQuery;
  /** Defaults to `id`. Use e.g. `startup_id` for 1:1 detail tables. */
  selectColumns?: string;
  /** Map the selected row to `{ id }` when the PK column is not `id`. */
  mapRow?: (row: Record<string, unknown>) => { id: string };
};

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

async function persistMediaUrlWithCas(
  persist: PersistMediaUrl,
  publicUrl: string,
  previousUrl: string | null | undefined,
): Promise<{
  error: { message?: string } | null;
  data: { id: string } | null;
}> {
  const selectColumns = persist.selectColumns ?? "id";
  const result = await withMediaUrlCas(
    persist.prepareUpdate(publicUrl),
    persist.column,
    previousUrl,
  )
    .select(selectColumns)
    .maybeSingle();

  if (result.error) {
    return { error: result.error, data: null };
  }
  if (result.data == null) {
    return { error: null, data: null };
  }

  const row = result.data as Record<string, unknown>;
  if (persist.mapRow) {
    return { error: null, data: persist.mapRow(row) };
  }

  const id = row.id;
  if (typeof id !== "string") {
    return { error: { message: "media CAS select missing id" }, data: null };
  }
  return { error: null, data: { id } };
}

/**
 * CDN-safe replace: process → versioned path (`entityId/nanoid.ext`) →
 * `upsert: false` + long cacheControl → CAS DB update → delete previous object.
 * Rolls back the new object if the DB update fails or CAS misses.
 *
 * Always pass `persistMediaUrl` (not a raw update) so concurrent replaces stay safe.
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
  persistMediaUrl: PersistMediaUrl;
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
    persistMediaUrl,
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
  let updated: { id: string } | null = null;
  try {
    const result = await persistMediaUrlWithCas(
      persistMediaUrl,
      publicUrl,
      previousUrl,
    );
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
