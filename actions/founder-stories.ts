"use server";

import { revalidatePath } from "next/cache";

import { getAdminResource } from "@/constants/admin-resources";
import { getStartupsForStoryPicker } from "@/data/founder-stories";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import {
  refreshAdminResource,
  runAdminMutation,
  type AdminActionResult,
} from "@/lib/admin/run-admin-mutation";
import type { StartupStoryOption } from "@/types/founder-story";
import {
  createFounderStorySchema,
  deleteFounderStorySchema,
  updateFounderStorySchema,
  type CreateFounderStoryInput,
  type DeleteFounderStoryInput,
  type UpdateFounderStoryInput,
} from "@/validations/founder-story";

export type FounderStoryActionResult = AdminActionResult;

const resource = getAdminResource("founderStories");

const MESSAGES = {
  unauthorized: "You do not have permission to manage founder stories.",
  signedInRequired: "You must be signed in.",
  invalidDetails: "Please check the form and try again.",
  createSuccess: "Founder story created successfully.",
  updateSuccess: "Founder story updated successfully.",
  deleteSuccess: "Founder story deleted successfully.",
  notFound: "Founder story not found.",
  duplicateStartup: "This startup already has a founder story.",
  genericError: "Something went wrong. Please try again.",
} as const;

/** Lazy searchable startup options for the founder-story editor. */
export async function loadStoryStartupOptions(input?: {
  search?: string;
  includeStartupId?: string;
}): Promise<
  | { status: "ok"; startups: StartupStoryOption[] }
  | { status: "error"; message: string }
> {
  const result = await getStartupsForStoryPicker({
    search: input?.search,
    includeStartupId: input?.includeStartupId,
  });
  if (result.status === "forbidden") {
    return { status: "error", message: MESSAGES.unauthorized };
  }
  return { status: "ok", startups: result.startups };
}

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
  // Detail HTML paths vary by startup slug; bust list + tag covers data cache.
  revalidatePath("/en/founders", "layout");
  revalidatePath("/fr/founders", "layout");
}

function normalizePermission(
  value: CreateFounderStoryInput["quotePermissionStatus"],
): "granted" | "pending" | "denied" | null {
  if (value === "" || value === null || value === undefined) return null;
  return value;
}

function toFounderStoryRow(
  input: CreateFounderStoryInput | UpdateFounderStoryInput,
) {
  const quoteText = emptyToNull(input.founderQuoteText);
  const hasQuote = Boolean(quoteText);

  return {
    startup_id: input.startupId,
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
    execute: async (session, data) => {
      const { data: row, error } = await session.supabase
        .from("founder_stories")
        .insert(toFounderStoryRow(data))
        .select("id")
        .single();

      if (error || !row?.id) {
        return { status: "error", pgError: error ?? {} };
      }
      return { status: "success", id: row.id };
    },
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
      const { data: row, error } = await session.supabase
        .from("founder_stories")
        .update(toFounderStoryRow(data))
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
      const { data: existing, error: existingError } = await session.supabase
        .from("founder_stories")
        .select("id")
        .eq("id", data.id)
        .maybeSingle();

      if (existingError) {
        return { status: "error", message: MESSAGES.genericError };
      }
      if (!existing) {
        return { status: "error", message: MESSAGES.notFound };
      }

      const { error: deleteError } = await session.supabase
        .from("founder_stories")
        .delete()
        .eq("id", data.id);

      if (deleteError) {
        return { status: "error", pgError: deleteError };
      }
      return { status: "success" };
    },
    refresh: (data) => refreshFounderStoryPaths(data.id),
  });
}
