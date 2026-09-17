import { z } from "zod";

import {
  CMS_PUBLISH_STATUSES,
  type CmsPublishStatus,
} from "@/constants/cms-publish";
import {
  parseAdminListQuery,
  type RawSearchParams,
} from "@/validations/admin-list-query";

export {
  CMS_PUBLISH_STATUSES,
  CMS_PUBLISH_STATUS_LABELS,
  type CmsPublishStatus,
} from "@/constants/cms-publish";

/** @deprecated Prefer `CmsPublishStatus` from `@/constants/cms-publish`. */
export type CmsPublishStatusInput = CmsPublishStatus;

export const FOUNDER_STORY_PAGE_SIZE = 20;

export const FOUNDER_STORY_NARRATIVE_MAX = 4000;
export const FOUNDER_STORY_QUOTE_MAX = 2000;
export const FOUNDER_STORY_ATTRIBUTION_NAME_MAX = 120;
export const FOUNDER_STORY_ATTRIBUTION_TITLE_MAX = 160;
export const FOUNDER_STORY_TITLE_MAX = 200;
export const FOUNDER_STORY_COVER_URL_MAX = 2048;
export const FOUNDER_STORY_HEADLINE_STAT_MAX = 80;

export const QUOTE_PERMISSION_STATUSES = [
  "granted",
  "pending",
  "denied",
] as const;
export type QuotePermissionStatusInput =
  (typeof QUOTE_PERMISSION_STATUSES)[number];

export const QUOTE_PERMISSION_STATUS_LABELS: Record<
  QuotePermissionStatusInput,
  string
> = {
  granted: "Granted",
  pending: "Pending",
  denied: "Denied",
};

const narrativeField = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(
      FOUNDER_STORY_NARRATIVE_MAX,
      `${label} must be at most ${FOUNDER_STORY_NARRATIVE_MAX} characters`,
    );

const optionalTrimmed = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .optional()
    .or(z.literal(""));

const optionalQuoteDate = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) =>
      value === undefined ||
      value === "" ||
      /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Quote date must be a valid date",
  );

const optionalPermission = z
  .enum(QUOTE_PERMISSION_STATUSES)
  .optional()
  .nullable()
  .or(z.literal(""));

export const founderStoryFieldsSchema = z
  .object({
    startupId: z.uuid("Select a startup"),
    storyTitle: narrativeField("Story title").pipe(z.string().max(FOUNDER_STORY_TITLE_MAX)),
    coverImageUrl: optionalTrimmed(FOUNDER_STORY_COVER_URL_MAX, "Cover image URL"),
    headlineStat: optionalTrimmed(FOUNDER_STORY_HEADLINE_STAT_MAX, "Headline stat"),
    theProblem: narrativeField("The problem"),
    whatTheyBuilt: narrativeField("What they built"),
    theAsipConnection: narrativeField("The ASIP connection"),
    whereTheyAreNow: narrativeField("Where they are now"),
    founderQuoteText: optionalTrimmed(FOUNDER_STORY_QUOTE_MAX, "Quote"),
    quoteAttributionName: optionalTrimmed(
      FOUNDER_STORY_ATTRIBUTION_NAME_MAX,
      "Attribution name",
    ),
    quoteAttributionTitle: optionalTrimmed(
      FOUNDER_STORY_ATTRIBUTION_TITLE_MAX,
      "Attribution title",
    ),
    quoteDate: optionalQuoteDate,
    quotePermissionStatus: optionalPermission,
    publishStatus: z.enum(CMS_PUBLISH_STATUSES),
  })
  .superRefine((value, ctx) => {
    const quote = (value.founderQuoteText ?? "").trim();
    const hasQuote = quote.length > 0;
    const attribution = (value.quoteAttributionName ?? "").trim();
    const permission =
      value.quotePermissionStatus === "" ||
      value.quotePermissionStatus === null ||
      value.quotePermissionStatus === undefined
        ? null
        : value.quotePermissionStatus;

    if (!hasQuote) return;

    if (attribution.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["quoteAttributionName"],
        message: "Attribution name is required when a quote is present",
      });
    }

    if (!permission) {
      ctx.addIssue({
        code: "custom",
        path: ["quotePermissionStatus"],
        message: "Quote permission is required when a quote is present",
      });
    }

    if (value.publishStatus === "published" && permission !== "granted") {
      ctx.addIssue({
        code: "custom",
        path: ["quotePermissionStatus"],
        message:
          "Quote permission must be granted before publishing a story with a quote",
      });
    }
  });

export const createFounderStorySchema = founderStoryFieldsSchema;

export const updateFounderStorySchema = founderStoryFieldsSchema.extend({
  id: z.uuid("Invalid story id"),
});

export const deleteFounderStorySchema = z.object({
  id: z.uuid("Invalid story id"),
});

export const founderStoryIdSchema = z.uuid("Invalid story id");

export type FounderStoryFormValues = z.input<typeof createFounderStorySchema>;
export type CreateFounderStoryInput = z.infer<typeof createFounderStorySchema>;
export type UpdateFounderStoryInput = z.infer<typeof updateFounderStorySchema>;
export type DeleteFounderStoryInput = z.infer<typeof deleteFounderStorySchema>;

const founderStoryListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z.string().trim().max(100).catch(""),
  status: z.enum(["all", ...CMS_PUBLISH_STATUSES]).catch("all"),
});

export type FounderStoryListQuery = z.infer<
  typeof founderStoryListQueryInputSchema
> & {
  pageSize: typeof FOUNDER_STORY_PAGE_SIZE;
};

export function parseFounderStoryListQuery(
  input: RawSearchParams,
): FounderStoryListQuery {
  return parseAdminListQuery({
    input,
    schema: founderStoryListQueryInputSchema,
    pageSize: FOUNDER_STORY_PAGE_SIZE,
    defaults: { page: "1", search: "", status: "all" },
  });
}
