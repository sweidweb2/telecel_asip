"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { nanoid } from "nanoid";

import { ROUTES } from "@/constants/routes";
import { PARTNERS_CACHE_TAG } from "@/data/partners";
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

export type PartnerActionResult =
  | { status: "success"; message: string; id?: string }
  | { status: "error"; message: string };

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

type AdminSession =
  | {
      status: "success";
      supabase: SupabaseServerClient;
    }
  | { status: "error"; message: string };

async function authorizeAdmin(): Promise<AdminSession> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "error", message: MESSAGES.signedInRequired };
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || !isAdmin) {
    return { status: "error", message: MESSAGES.unauthorized };
  }

  return { status: "success", supabase };
}

function refreshPartnerPaths() {
  revalidateTag(PARTNERS_CACHE_TAG, "max");
  revalidatePath(ROUTES.partners);
  revalidatePath("/en/partners");
  revalidatePath("/fr/partners");
}

function emptyToNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
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
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "42501" || message.includes("not authorized")) {
    return MESSAGES.unauthorized;
  }
  if (code === "PGRST116" || message.includes("no rows")) {
    return MESSAGES.notFound;
  }
  return MESSAGES.genericError;
}

export async function createPartner(
  input: CreatePartnerInput,
): Promise<PartnerActionResult> {
  const parsed = createPartnerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin();
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("partners")
    .insert(toPartnerRow(parsed.data))
    .select("id")
    .single();

  if (error || !data?.id) {
    return { status: "error", message: writeErrorMessage(error ?? {}) };
  }

  refreshPartnerPaths();
  return { status: "success", message: MESSAGES.createSuccess, id: data.id };
}

export async function updatePartner(
  input: UpdatePartnerInput,
): Promise<PartnerActionResult> {
  const parsed = updatePartnerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin();
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("partners")
    .update(toPartnerRow(parsed.data))
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: writeErrorMessage(error) };
  }
  if (!data?.id) {
    return { status: "error", message: MESSAGES.notFound };
  }

  refreshPartnerPaths();
  return { status: "success", message: MESSAGES.updateSuccess, id: data.id };
}

export async function deletePartner(
  input: DeletePartnerInput,
): Promise<PartnerActionResult> {
  const parsed = deletePartnerSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeAdmin();
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("partners")
    .select("id, logo_url")
    .eq("id", parsed.data.id)
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
    .eq("id", parsed.data.id);

  if (deleteError) {
    return { status: "error", message: writeErrorMessage(deleteError) };
  }

  // Storage only after the row is gone: a failure here leaks an orphan object
  // instead of leaving a live row pointing at a deleted logo.
  await removePartnerStorageFolder(session.supabase, parsed.data.id);

  refreshPartnerPaths();
  return { status: "success", message: MESSAGES.deleteSuccess };
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
  if (!partnerIdSchema.safeParse(partnerId).success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { status: "error", message: MESSAGES.invalidImage };
  }

  if (!ALLOWED_MIME.has(file.type) || file.size <= 0 || file.size > LOGO_MAX_BYTES) {
    return { status: "error", message: MESSAGES.invalidImage };
  }

  const session = await authorizeAdmin();
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
  return { status: "success", message: MESSAGES.uploadSuccess, id: partnerId };
}

export async function removePartnerLogo(
  partnerId: string,
): Promise<PartnerActionResult> {
  if (!partnerIdSchema.safeParse(partnerId).success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeAdmin();
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
