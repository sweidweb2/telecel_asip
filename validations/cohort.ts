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

export const COHORT_PAGE_SIZE = 20;

export const COHORT_PUBLIC_LABEL_MAX = 160;
export const COHORT_SUMMARY_MAX = 5000;
export const COHORT_MEDIA_URL_MAX = 500;
export const COHORT_YEAR_MIN = 1900;
export const COHORT_YEAR_MAX = 2100;
export const COHORT_LINKS_MAX = 500;

export const COHORT_PROGRAMME_STATUSES = ["closed", "open", "hold"] as const;
export type CohortProgrammeStatusInput =
  (typeof COHORT_PROGRAMME_STATUSES)[number];

export const COHORT_PROGRAMME_STATUS_LABELS: Record<
  CohortProgrammeStatusInput,
  string
> = {
  closed: "Closed",
  open: "Open",
  hold: "Hold",
};

const optionalDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
  .optional()
  .or(z.literal(""));

const optionalSummary = z
  .string()
  .trim()
  .max(
    COHORT_SUMMARY_MAX,
    `Summary must be at most ${COHORT_SUMMARY_MAX} characters`,
  )
  .optional()
  .or(z.literal(""));

const optionalMediaUrl = z
  .string()
  .trim()
  .max(
    COHORT_MEDIA_URL_MAX,
    `Media URL must be at most ${COHORT_MEDIA_URL_MAX} characters`,
  )
  .refine(
    (value) => value === "" || /^https?:\/\/.+/i.test(value),
    "Media URL must be a valid http(s) URL",
  )
  .optional()
  .or(z.literal(""));

const uuidList = (label: string) =>
  z
    .array(z.uuid(`Invalid ${label} id`))
    .max(COHORT_LINKS_MAX)
    .transform((ids) => [...new Set(ids)]);

const yearField = z
  .number()
  .int("Year must be a whole number")
  .min(COHORT_YEAR_MIN, `Year must be at least ${COHORT_YEAR_MIN}`)
  .max(COHORT_YEAR_MAX, `Year must be at most ${COHORT_YEAR_MAX}`);

export const cohortFieldsSchema = z
  .object({
    year: yearField,
    publicLabel: z
      .string()
      .trim()
      .min(2, "Public label must be at least 2 characters")
      .max(
        COHORT_PUBLIC_LABEL_MAX,
        `Public label must be at most ${COHORT_PUBLIC_LABEL_MAX} characters`,
      ),
    programmeDatesStart: optionalDate,
    programmeDatesEnd: optionalDate,
    programmeStatus: z.enum(COHORT_PROGRAMME_STATUSES),
    summary: optionalSummary,
    mediaUrl: optionalMediaUrl,
    publishStatus: z.enum(CMS_PUBLISH_STATUSES),
    partnerIds: uuidList("partner"),
    startupIds: uuidList("startup"),
  })
  .superRefine((value, ctx) => {
    const start = value.programmeDatesStart || "";
    const end = value.programmeDatesEnd || "";
    if (start && end && end < start) {
      ctx.addIssue({
        code: "custom",
        path: ["programmeDatesEnd"],
        message: "End date must be on or after the start date",
      });
    }
  });

export const createCohortSchema = cohortFieldsSchema;

export const updateCohortSchema = cohortFieldsSchema.and(
  z.object({
    id: z.uuid("Invalid cohort id"),
  }),
);

export const deleteCohortSchema = z.object({
  id: z.uuid("Invalid cohort id"),
});

export const cohortIdSchema = z.uuid("Invalid cohort id");

export type CreateCohortInput = z.infer<typeof createCohortSchema>;
export type UpdateCohortInput = z.infer<typeof updateCohortSchema>;
export type DeleteCohortInput = z.infer<typeof deleteCohortSchema>;

const cohortListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z
    .string()
    .trim()
    .max(100)
    .regex(/^[^,%_()]*$/)
    .catch(""),
  status: z.enum(["all", ...CMS_PUBLISH_STATUSES]).catch("all"),
});

export type CohortListQuery = z.infer<typeof cohortListQueryInputSchema> & {
  pageSize: typeof COHORT_PAGE_SIZE;
};

export function parseCohortListQuery(input: RawSearchParams): CohortListQuery {
  return parseAdminListQuery({
    input,
    schema: cohortListQueryInputSchema,
    pageSize: COHORT_PAGE_SIZE,
    defaults: { page: "1", search: "", status: "all" },
  });
}
