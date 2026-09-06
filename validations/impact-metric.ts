import { z } from "zod";

import {
  parseAdminListQuery,
  type RawSearchParams,
} from "@/validations/admin-list-query";

export const IMPACT_METRIC_PAGE_SIZE = 20;

export const IMPACT_CLAIM_LABEL_MAX = 200;
export const IMPACT_VALUE_MAX = 80;
export const IMPACT_UNIT_MAX = 40;
export const IMPACT_GEOGRAPHY_MAX = 120;
export const IMPACT_DISPLAY_LOCATION_MAX = 80;
export const IMPACT_DISPLAY_LOCATIONS_MAX = 20;

export const IMPACT_LENSES = [
  "pipeline",
  "inclusion",
  "business_growth",
  "commercialisation",
  "jobs_capability",
  "sector_outcomes",
] as const;

export const IMPACT_PUBLISH_STATUSES = [
  "verified",
  "pending",
  "outdated",
  "disputed",
  "not_for_publication",
] as const;

export type ImpactLensInput = (typeof IMPACT_LENSES)[number];
export type ImpactPublishStatusInput = (typeof IMPACT_PUBLISH_STATUSES)[number];

const optionalText = (max: number, min = 1) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .refine(
      (value) => value === "" || value.length >= min,
      `Must be at least ${min} characters`,
    )
    .optional()
    .or(z.literal(""));

/** ISO date string `YYYY-MM-DD` from the admin DatePicker. */
const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");

const displayLocations = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value, ctx) => {
    const raw = Array.isArray(value)
      ? value
      : typeof value === "string"
        ? value.split(/[\n,]/)
        : [];
    const cleaned = raw
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (cleaned.length > IMPACT_DISPLAY_LOCATIONS_MAX) {
      ctx.addIssue({
        code: "custom",
        message: `At most ${IMPACT_DISPLAY_LOCATIONS_MAX} display locations`,
      });
      return z.NEVER;
    }

    for (const item of cleaned) {
      if (item.length > IMPACT_DISPLAY_LOCATION_MAX) {
        ctx.addIssue({
          code: "custom",
          message: `Each location must be at most ${IMPACT_DISPLAY_LOCATION_MAX} characters`,
        });
        return z.NEVER;
      }
    }

    return cleaned;
  });

const impactMetricObjectSchema = z.object({
  claimLabel: z
    .string()
    .trim()
    .min(2, "Claim label must be at least 2 characters")
    .max(
      IMPACT_CLAIM_LABEL_MAX,
      `Claim label must be at most ${IMPACT_CLAIM_LABEL_MAX} characters`,
    ),
  value: z
    .string()
    .trim()
    .min(1, "Value is required")
    .max(
      IMPACT_VALUE_MAX,
      `Value must be at most ${IMPACT_VALUE_MAX} characters`,
    ),
  unit: optionalText(IMPACT_UNIT_MAX),
  periodStart: dateString,
  periodEnd: dateString,
  geography: optionalText(IMPACT_GEOGRAPHY_MAX, 2),
  impactLens: z.enum(IMPACT_LENSES).nullable().optional(),
  displayLocations,
  evidenceId: z.uuid("Select an evidence record"),
  publishStatus: z.enum(IMPACT_PUBLISH_STATUSES),
});

function refinePeriodRange<T extends { periodStart: string; periodEnd: string }>(
  data: T,
  ctx: z.RefinementCtx,
) {
  if (data.periodEnd < data.periodStart) {
    ctx.addIssue({
      code: "custom",
      path: ["periodEnd"],
      message: "Period end must be on or after period start",
    });
  }
}

export const createImpactMetricSchema =
  impactMetricObjectSchema.superRefine(refinePeriodRange);

export const updateImpactMetricSchema = impactMetricObjectSchema
  .extend({ id: z.uuid("Invalid impact metric id") })
  .superRefine(refinePeriodRange);

export const deleteImpactMetricSchema = z.object({
  id: z.uuid("Invalid impact metric id"),
});

export const impactMetricIdSchema = z.uuid("Invalid impact metric id");

/** Raw form values before Zod coercion (e.g. display locations as a string). */
export type ImpactMetricFormValues = z.input<typeof createImpactMetricSchema>;
export type CreateImpactMetricInput = z.infer<typeof createImpactMetricSchema>;
export type UpdateImpactMetricInput = z.infer<typeof updateImpactMetricSchema>;
export type DeleteImpactMetricInput = z.infer<typeof deleteImpactMetricSchema>;

const impactMetricListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z.string().trim().max(100).catch(""),
  lens: z.enum(["all", ...IMPACT_LENSES]).catch("all"),
  publishStatus: z.enum(["all", ...IMPACT_PUBLISH_STATUSES]).catch("all"),
});

export type ImpactMetricListQuery = z.infer<
  typeof impactMetricListQueryInputSchema
> & {
  pageSize: typeof IMPACT_METRIC_PAGE_SIZE;
};

export function parseImpactMetricListQuery(
  input: RawSearchParams,
): ImpactMetricListQuery {
  return parseAdminListQuery({
    input,
    schema: impactMetricListQueryInputSchema,
    pageSize: IMPACT_METRIC_PAGE_SIZE,
    defaults: {
      page: "1",
      search: "",
      lens: "all",
      publishStatus: "all",
    },
  });
}
