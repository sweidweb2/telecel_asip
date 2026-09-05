"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { FOUNDER_STORIES_CACHE_TAG } from "@/data/founder-stories";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import { mapPgActionError } from "@/lib/admin/pg-action-error";
import {
  createFounderStorySchema,
  deleteFounderStorySchema,
  updateFounderStorySchema,
  type CreateFounderStoryInput,
  type DeleteFounderStoryInput,
  type UpdateFounderStoryInput,
} from "@/validations/founder-story";

export type FounderStoryActionResult =
  | { status: "success"; message: string; id?: string }
  | { status: "error"; message: string };

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

const PG_MESSAGES = {
  unauthorized: MESSAGES.unauthorized,
  notFound: MESSAGES.notFound,
  genericError: MESSAGES.genericError,
  uniqueViolation: MESSAGES.duplicateStartup,
  uniqueConstraint: "founder_stories_startup_id",
};

function refreshFounderStoryPaths() {
  revalidateTag(FOUNDER_STORIES_CACHE_TAG, "max");
  revalidatePath(ROUTES.founderStories);
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
  const parsed = createFounderStorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("founder_stories")
    .insert(toFounderStoryRow(parsed.data))
    .select("id")
    .single();

  if (error || !data?.id) {
    return {
      status: "error",
      message: mapPgActionError(error ?? {}, PG_MESSAGES),
    };
  }

  refreshFounderStoryPaths();
  return { status: "success", message: MESSAGES.createSuccess, id: data.id };
}

export async function updateFounderStory(
  input: UpdateFounderStoryInput,
): Promise<FounderStoryActionResult> {
  const parsed = updateFounderStorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? MESSAGES.invalidDetails,
    };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data, error } = await session.supabase
    .from("founder_stories")
    .update(toFounderStoryRow(parsed.data))
    .eq("id", parsed.data.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: mapPgActionError(error, PG_MESSAGES) };
  }
  if (!data?.id) {
    return { status: "error", message: MESSAGES.notFound };
  }

  refreshFounderStoryPaths();
  revalidatePath(`${ROUTES.founderStories}/${data.id}`);
  return { status: "success", message: MESSAGES.updateSuccess, id: data.id };
}

export async function deleteFounderStory(
  input: DeleteFounderStoryInput,
): Promise<FounderStoryActionResult> {
  const parsed = deleteFounderStorySchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const session = await authorizeAdmin(MESSAGES);
  if (session.status === "error") return session;

  const { data: existing, error: existingError } = await session.supabase
    .from("founder_stories")
    .select("id")
    .eq("id", parsed.data.id)
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
    .eq("id", parsed.data.id);

  if (deleteError) {
    return { status: "error", message: mapPgActionError(deleteError, PG_MESSAGES) };
  }

  refreshFounderStoryPaths();
  return { status: "success", message: MESSAGES.deleteSuccess };
}
