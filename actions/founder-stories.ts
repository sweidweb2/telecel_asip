"use server";

import { revalidatePath } from "next/cache";

import { getAdminResource } from "@/constants/admin-resources";
import { emptyToNull } from "@/lib/admin/empty-to-null";
import {
  refreshAdminResource,
  runAdminMutation
} from "@/lib/admin/run-admin-mutation";
import type { AdminActionResult } from "@/types/admin-action";
import { writeAdminRow } from "@/lib/admin/write-admin-row";
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
) {
  const quoteText = emptyToNull(input.founderQuoteText);
  const hasQuote = Boolean(quoteText);

  return {
    startup_id: input.startupId,
    story_title: input.storyTitle,
    cover_image_url: emptyToNull(input.coverImageUrl),
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
        values: toFounderStoryRow(data),
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
    execute: (session, data) =>
      writeAdminRow(session.supabase, {
        op: "update",
        table: "founder_stories",
        id: data.id,
        values: toFounderStoryRow(data),
        notFound: MESSAGES.notFound,
      }),
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
    execute: (session, data) =>
      writeAdminRow(session.supabase, {
        op: "delete",
        table: "founder_stories",
        id: data.id,
        notFound: MESSAGES.notFound,
      }),
    refresh: (data) => refreshFounderStoryPaths(data.id),
  });
}
