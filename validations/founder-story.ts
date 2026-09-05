import { z } from "zod";

export const FOUNDER_STORY_PAGE_SIZE = 20;

export const FOUNDER_STORY_NARRATIVE_MAX = 4000;
export const FOUNDER_STORY_QUOTE_MAX = 2000;
export const FOUNDER_STORY_ATTRIBUTION_NAME_MAX = 120;
export const FOUNDER_STORY_ATTRIBUTION_TITLE_MAX = 160;

export const CMS_PUBLISH_STATUSES = ["draft", "published"] as const;
export type CmsPublishStatusInput = (typeof CMS_PUBLISH_STATUSES)[number];

export const QUOTE_PERMISSION_STATUSES = [
  "granted",
  "pending",
  "denied",
] as const;
export type QuotePermissionStatusInput =
  (typeof QUOTE_PERMISSION_STATUSES)[number];

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

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseFounderStoryListQuery(
  input: RawSearchParams,
): FounderStoryListQuery {
  const parsed = founderStoryListQueryInputSchema.parse({
    page: first(input.page) ?? "1",
    search: first(input.search) ?? "",
    status: first(input.status) ?? "all",
  });

  return { ...parsed, pageSize: FOUNDER_STORY_PAGE_SIZE };
}
