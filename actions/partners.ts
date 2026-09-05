"use server";

import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

import { getAdminResource } from "@/constants/admin-resources";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { traceAsync } from "@/lib/admin/perf";
import { processImageBuffer } from "@/lib/media/process-image";
import {
  publicObjectUrl,
  storagePathFromPublicUrl,
} from "@/lib/storage/public-url";
import { createClient } from "@/lib/supabase/server";
import {
  createPartnerSchema,
  deletePartnerSchema,
  partnerIdSchema,
  updatePartnerSchema,
  type CreatePartnerInput,
  type DeletePartnerInput,
  type UpdatePartnerInput,
} from "@/validations/partner";

export type PartnerActionResult = AdminActionResult;

const resource = getAdminResource("partners");

const MESSAGES = {
  unauthorized: "You do not have permission to manage partners.",
  signedInRequired: "You must be signed in.",
  invalidDetails: "Please check the form and try again.",
  createSuccess: "Partner created successfully.",
  updateSuccess: "Partner updated successfully.",
  deleteSuccess: "Partner deleted successfully.",
  uploadSuccess: "Logo uploaded successfully.",
  removeSuccess: "Logo removed successfully.",
  notFound: "Partner not found.",
  genericError: "Something went wrong. Please try again.",
  invalidImage: "Please upload a JPEG, PNG, WebP, or GIF under 2 MB.",
} as const;

const LOGO_BUCKET = "partners";
const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const LOGO_CACHE_CONTROL = "31536000";
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const PG_MESSAGES = {
  unauthorized: MESSAGES.unauthorized,
  notFound: MESSAGES.notFound,
  genericError: MESSAGES.genericError,
};

function refreshPartnerPaths() {
  refreshAdminResource({
    listPath: resource.listPath,
    cacheTags: resource.cacheTags,
  });
  revalidatePath("/en/partners");
  revalidatePath("/fr/partners");
}

function toPartnerRow(input: CreatePartnerInput | UpdatePartnerInput) {
  return {
    name: input.name,
    org: emptyToNull(input.org),
    type: input.type,
    contribution: emptyToNull(input.contribution),
    is_active: input.isActive,
    logo_permission: input.logoPermission,
    link: emptyToNull(input.link),
    sort_order: input.sortOrder ?? 0,
  };
}

function writeErrorMessage(error: { code?: string; message?: string }): string {
  return mapPgActionError(error, PG_MESSAGES);
}

export async function createPartner(
  input: CreatePartnerInput,
): Promise<PartnerActionResult> {
  return runAdminMutation({
    schema: createPartnerSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.createSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("partners")
        .insert(toPartnerRow(data))
        .select("id")
        .single();

      if (error || !row?.id) {
        return { status: "error", pgError: error ?? {} };
      }
      return { status: "success", id: row.id };
    },
    refresh: () => refreshPartnerPaths(),
  });
}

export async function updatePartner(
  input: UpdatePartnerInput,
): Promise<PartnerActionResult> {
  return runAdminMutation({
    schema: updatePartnerSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.updateSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("partners")
        .update(toPartnerRow(data))
        .eq("id", data.id)
        .select("id")
        .maybeSingle();

      if (error) {
        return { status: "error", pgError: error };
      }
      if (!row?.id) {
        return { status: "error", message: MESSAGES.notFound };
      }
      return { status: "success", id: row.id };
    },
    refresh: () => refreshPartnerPaths(),
  });
}

export async function deletePartner(
  input: DeletePartnerInput,
): Promise<PartnerActionResult> {
  return runAdminMutation({
    schema: deletePartnerSchema,
    input,
    messages: {
      ...MESSAGES,
      success: MESSAGES.deleteSuccess,
    },
    pgMessages: PG_MESSAGES,
    execute: async (session, data) => {
      const { data: existing, error: existingError } = await session.supabase
        .from("partners")
        .select("id, logo_url")
        .eq("id", data.id)
        .maybeSingle();

      if (existingError) {
        return { status: "error", message: MESSAGES.genericError };
      }
      if (!existing) {
        return { status: "error", message: MESSAGES.notFound };
      }

      const { error: deleteError } = await session.supabase
        .from("partners")
        .delete()
        .eq("id", data.id);

      if (deleteError) {
        return { status: "error", pgError: deleteError };
      }

      // Storage only after the row is gone: a failure here leaks an orphan object
      // instead of leaving a live row pointing at a deleted logo.
      await removePartnerStorageFolder(session.supabase, data.id);

      return { status: "success" };
    },
    refresh: () => refreshPartnerPaths(),
  });
}

async function removeStoragePaths(
  supabase: SupabaseServerClient,
  paths: string[],
) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(LOGO_BUCKET).remove(paths);
  if (error) {
    // Orphaned objects — the DB is already consistent, so surface them for
    // cleanup rather than failing the action.
    console.error("Failed to remove storage objects", {
      bucket: LOGO_BUCKET,
      paths,
      error,
    });
  }
}

async function removeStorageUrlIfOwned(
  supabase: SupabaseServerClient,
  url: string | null | undefined,
) {
  const path = storagePathFromPublicUrl(url, LOGO_BUCKET);
  if (!path) return;
  await removeStoragePaths(supabase, [path]);
}

/**
 * Clears the whole `${partnerId}/` prefix, not just the referenced logo: failed
 * uploads and concurrent replaces leave objects no row points at, and after the
 * row is deleted nothing else can ever reference them.
 */
async function removePartnerStorageFolder(
  supabase: SupabaseServerClient,
  partnerId: string,
) {
  const { data, error } = await supabase.storage
    .from(LOGO_BUCKET)
    .list(partnerId, { limit: 100 });

  if (error) {
    console.error("Failed to list partner storage folder", {
      bucket: LOGO_BUCKET,
      partnerId,
      error,
    });
    return;
  }

  await removeStoragePaths(
    supabase,
    (data ?? []).map((object) => `${partnerId}/${object.name}`),
  );
}

export async function uploadPartnerLogo(
  partnerId: string,
  formData: FormData,
): Promise<PartnerActionResult> {
  return traceAsync(
    "uploadPartnerLogo",
    { eventType: "upload", cacheStatus: "n_a", meta: { partnerId } },
    async () => {
      if (!partnerIdSchema.safeParse(partnerId).success) {
        return { status: "error", message: MESSAGES.invalidDetails };
      }

      const file = formData.get("file");
      if (!(file instanceof File)) {
        return { status: "error", message: MESSAGES.invalidImage };
      }

      if (
        !ALLOWED_MIME.has(file.type) ||
        file.size <= 0 ||
        file.size > LOGO_MAX_BYTES
      ) {
        return { status: "error", message: MESSAGES.invalidImage };
      }

      const session = await authorizeAdmin(MESSAGES);
      if (session.status === "error") return session;

      const { data: existing, error: existingError } = await session.supabase
        .from("partners")
        .select("id, logo_url")
        .eq("id", partnerId)
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
          "partnerLogo",
        );
      } catch {
        return { status: "error", message: MESSAGES.invalidImage };
      }

      const path = `${partnerId}/${nanoid(10)}.${processed.extension}`;

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
        .from("partners")
        .update({ logo_url: publicUrl })
        .eq("id", partnerId);

      if (updateError) {
        await session.supabase.storage.from(LOGO_BUCKET).remove([path]);
        return { status: "error", message: MESSAGES.genericError };
      }

      await removeStorageUrlIfOwned(session.supabase, existing.logo_url);
      refreshPartnerPaths();
      return {
        status: "success",
        message: MESSAGES.uploadSuccess,
        id: partnerId,
      };
    },
  );
}

export async function removePartnerLogo(
  partnerId: string,
): Promise<PartnerActionResult> {
  if (!partnerIdSchema.safeParse(partnerId).success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("partners")
    .select("id, logo_url")
    .eq("id", partnerId)
    .maybeSingle();

  if (existingError) {
    return { status: "error", message: MESSAGES.genericError };
  }
  if (!existing) {
    return { status: "error", message: MESSAGES.notFound };
  }

  const { error: updateError } = await session.supabase
    .from("partners")
    .update({ logo_url: null })
    .eq("id", partnerId);

  if (updateError) {
    return { status: "error", message: writeErrorMessage(updateError) };
  }

  await removeStorageUrlIfOwned(session.supabase, existing.logo_url);

  refreshPartnerPaths();
  return { status: "success", message: MESSAGES.removeSuccess, id: partnerId };
}
