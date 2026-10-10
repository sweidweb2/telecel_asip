"use server";

import { revalidatePath } from "next/cache";

import { getAdminResource } from "@/constants/admin-resources";
import { authorizeEditor } from "@/lib/admin/authorize-editor";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import { writeAdminRow } from "@/lib/admin/write-admin-row";
import { traceAsync } from "@/lib/admin/perf";
import {
  removeOwnedPublicStorageObject,
  uploadVersionedPublicImage,
} from "@/lib/media/upload-versioned-public-image";
import { createClient } from "@/lib/supabase/server";
import {
  planSortOrderDisplacement,
  type PartnerSortOrderOccupant,
} from "@/lib/partners/sort-order";
import {
  createPartnerSchema,
  deletePartnerSchema,
  partnerIdSchema,
  PARTNER_SORT_ORDER_MIN,
  updatePartnerActiveSchema,
  updatePartnerLogoPermissionSchema,
  updatePartnerSchema,
  type CreatePartnerInput,
  type DeletePartnerInput,
  type UpdatePartnerActiveInput,
  type UpdatePartnerInput,
  type UpdatePartnerLogoPermissionInput,
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
  activeSuccess: "Partner marked as active.",
  historicalSuccess: "Partner marked as historical.",
  logoGrantedSuccess: "Logo permission granted.",
  logoRevokedSuccess: "Logo permission revoked.",
  uploadSuccess: "Logo uploaded successfully.",
  removeSuccess: "Logo removed successfully.",
  notFound: "Partner not found.",
  genericError: "Something went wrong. Please try again.",
  invalidImage: "Please upload a JPEG, PNG, WebP, or GIF under 2 MB.",
} as const;

const LOGO_BUCKET = "partners";
const LOGO_MAX_BYTES = 2 * 1024 * 1024;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const PG_MESSAGES = {
  unauthorized: MESSAGES.unauthorized,
  notFound: MESSAGES.notFound,
  genericError: MESSAGES.genericError,
};

function refreshPartnerPaths(id?: string) {
  refreshAdminResource({
    listPath: resource.listPath,
    detailPath: id ? `${resource.listPath}/${id}` : undefined,
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
    sort_order: input.sortOrder ?? PARTNER_SORT_ORDER_MIN,
  };
}

function writeErrorMessage(error: { code?: string; message?: string }): string {
  return mapPgActionError(error, PG_MESSAGES);
}

async function loadSortOrderOccupants(
  supabase: SupabaseServerClient,
): Promise<PartnerSortOrderOccupant[]> {
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PartnerSortOrderOccupant[];
}

/**
 * If another partner already owns `desiredOrder`, move them to the first free
 * slot before writing the editor partner.
 */
async function displaceSortOrderIfNeeded(
  supabase: SupabaseServerClient,
  desiredOrder: number,
  currentPartnerId?: string,
): Promise<{ error?: { code?: string; message?: string } }> {
  const partners = await loadSortOrderOccupants(supabase);
  const plan = planSortOrderDisplacement({
    desiredOrder,
    currentPartnerId,
    partners,
  });
  if (!plan) return {};

  const { error } = await supabase
    .from("partners")
    .update({ sort_order: plan.displace.toOrder })
    .eq("id", plan.displace.id);

  return error ? { error } : {};
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
      const desiredOrder = data.sortOrder ?? PARTNER_SORT_ORDER_MIN;
      const displaced = await displaceSortOrderIfNeeded(
        session.supabase,
        desiredOrder,
      );
      if (displaced.error) {
        return { status: "error", pgError: displaced.error };
      }

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
    refresh: (_data, id) => refreshPartnerPaths(id),
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
      const desiredOrder = data.sortOrder ?? PARTNER_SORT_ORDER_MIN;
      const displaced = await displaceSortOrderIfNeeded(
        session.supabase,
        desiredOrder,
        data.id,
      );
      if (displaced.error) {
        return { status: "error", pgError: displaced.error };
      }

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
    refresh: (_data, id) => refreshPartnerPaths(id),
  });
}

export async function updatePartnerActive(
  input: UpdatePartnerActiveInput,
): Promise<PartnerActionResult> {
  return runAdminMutation({
    schema: updatePartnerActiveSchema,
    input,
    messages: {
      ...MESSAGES,
      success: input.isActive
        ? MESSAGES.activeSuccess
        : MESSAGES.historicalSuccess,
    },
    pgMessages: PG_MESSAGES,
    perfName: "updatePartnerActive",
    execute: (session, data) =>
      writeAdminRow(session.supabase, {
        op: "update",
        table: "partners",
        id: data.id,
        values: { is_active: data.isActive },
        notFound: MESSAGES.notFound,
      }),
    refresh: (_data, id) => refreshPartnerPaths(id),
  });
}

export async function updatePartnerLogoPermission(
  input: UpdatePartnerLogoPermissionInput,
): Promise<PartnerActionResult> {
  return runAdminMutation({
    schema: updatePartnerLogoPermissionSchema,
    input,
    messages: {
      ...MESSAGES,
      success: input.logoPermission
        ? MESSAGES.logoGrantedSuccess
        : MESSAGES.logoRevokedSuccess,
    },
    pgMessages: PG_MESSAGES,
    perfName: "updatePartnerLogoPermission",
    execute: (session, data) =>
      writeAdminRow(session.supabase, {
        op: "update",
        table: "partners",
        id: data.id,
        values: { logo_permission: data.logoPermission },
        notFound: MESSAGES.notFound,
      }),
    refresh: (_data, id) => refreshPartnerPaths(id),
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
    refresh: (data) => refreshPartnerPaths(data.id),
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
  await removeOwnedPublicStorageObject(supabase, url, LOGO_BUCKET);
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

      const session = await authorizeEditor(MESSAGES);
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

      const uploaded = await uploadVersionedPublicImage({
        supabase: session.supabase,
        file,
        bucket: LOGO_BUCKET,
        entityId: partnerId,
        preset: "partnerLogo",
        previousUrl: existing.logo_url,
        maxBytes: LOGO_MAX_BYTES,
        messages: MESSAGES,
        updateRow: async (publicUrl) =>
          session.supabase
            .from("partners")
            .update({ logo_url: publicUrl })
            .eq("id", partnerId),
      });

      if (uploaded.status === "error") return uploaded;

      refreshPartnerPaths(partnerId);
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

  const session = await authorizeEditor(MESSAGES);
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

  refreshPartnerPaths(partnerId);
  return { status: "success", message: MESSAGES.removeSuccess, id: partnerId };
}
