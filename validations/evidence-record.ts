import { z } from "zod";

import {
  EVIDENCE_PERMISSIONS,
  EVIDENCE_STATUSES,
} from "@/constants/evidence-labels";

export const EVIDENCE_PAGE_SIZE = 20;
export const EVIDENCE_PRIMARY_SOURCE_MAX = 2000;
export const EVIDENCE_SOURCE_URL_MAX = 500;

const dateString = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date (YYYY-MM-DD)");

const optionalUrl = z
  .string()
  .trim()
  .max(
    EVIDENCE_SOURCE_URL_MAX,
    `URL must be at most ${EVIDENCE_SOURCE_URL_MAX} characters`,
  )
  .refine(
    (value) => value === "" || /^https?:\/\/.+/i.test(value),
    "URL must be a valid http(s) URL",
  )
  .optional()
  .or(z.literal(""));

const evidenceFieldsObject = z.object({
  primarySource: z
    .string()
    .trim()
    .min(2, "Primary source must be at least 2 characters")
    .max(
      EVIDENCE_PRIMARY_SOURCE_MAX,
      `Primary source must be at most ${EVIDENCE_PRIMARY_SOURCE_MAX} characters`,
    ),
  sourceFileUrl: optionalUrl,
  measurementPeriodStart: dateString,
  measurementPeriodEnd: dateString,
  ownerId: z.uuid("Select an owner"),
  status: z.enum(EVIDENCE_STATUSES),
  lastVerifiedDate: dateString,
  permission: z.enum(EVIDENCE_PERMISSIONS),
  reviewDate: dateString,
});

function refinePeriodRange<T extends z.infer<typeof evidenceFieldsObject>>(
  value: T,
  ctx: z.RefinementCtx,
) {
  if (value.measurementPeriodEnd < value.measurementPeriodStart) {
    ctx.addIssue({
      code: "custom",
      message: "Period end must be on or after the start date",
      path: ["measurementPeriodEnd"],
    });
  }
}

export const createEvidenceRecordSchema =
  evidenceFieldsObject.superRefine(refinePeriodRange);

export const updateEvidenceRecordSchema = evidenceFieldsObject
  .extend({
    id: z.uuid("Invalid evidence id"),
  })
  .superRefine(refinePeriodRange);

export const deleteEvidenceRecordSchema = z.object({
  id: z.uuid("Invalid evidence id"),
});

export const evidenceRecordIdSchema = z.uuid("Invalid evidence id");

export type EvidenceFormValues = z.input<typeof createEvidenceRecordSchema>;
export type CreateEvidenceRecordInput = z.infer<
  typeof createEvidenceRecordSchema
>;
export type UpdateEvidenceRecordInput = z.infer<
  typeof updateEvidenceRecordSchema
>;
export type DeleteEvidenceRecordInput = z.infer<
  typeof deleteEvidenceRecordSchema
>;

const evidenceListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  search: z.string().trim().max(100).catch(""),
  status: z.enum(["all", ...EVIDENCE_STATUSES]).catch("all"),
  permission: z.enum(["all", ...EVIDENCE_PERMISSIONS]).catch("all"),
});

export type EvidenceListQuery = z.infer<typeof evidenceListQueryInputSchema> & {
  pageSize: typeof EVIDENCE_PAGE_SIZE;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseEvidenceListQuery(
  input: RawSearchParams,
): EvidenceListQuery {
  const parsed = evidenceListQueryInputSchema.parse({
    page: first(input.page) ?? "1",
    search: first(input.search) ?? "",
    status: first(input.status) ?? "all",
    permission: first(input.permission) ?? "all",
  });

  return { ...parsed, pageSize: EVIDENCE_PAGE_SIZE };
}
