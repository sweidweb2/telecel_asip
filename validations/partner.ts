import { z } from "zod";

import {
  parseAdminListQuery,
  type RawSearchParams,
} from "@/validations/admin-list-query";

export const PARTNER_PAGE_SIZE = 20;

export const PARTNER_NAME_MAX = 120;
export const PARTNER_ORG_MAX = 160;
export const PARTNER_CONTRIBUTION_MAX = 2000;
export const PARTNER_LINK_MAX = 500;
export const PARTNER_SORT_ORDER_MAX = 10_000;

/**
 * Mirrors `public.partner_type` and the `rows[].id` keys in
 * `constants/partners-copy.ts`, so the public page groups DB rows under the
 * bilingual labels that already exist.
 */
export const PARTNER_TYPES = [
  "corporate",
  "investors",
  "technology",
  "development",
  "mentors",
  "media",
] as const;

export type PartnerTypeInput = (typeof PARTNER_TYPES)[number];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .optional()
    .or(z.literal(""));

const optionalUrl = z
  .string()
  .trim()
  .max(PARTNER_LINK_MAX, `Link must be at most ${PARTNER_LINK_MAX} characters`)
  .refine(
    (value) => value === "" || /^https?:\/\/.+/i.test(value),
    "Link must be a valid http(s) URL",
  )
  .optional()
  .or(z.literal(""));

/**
 * Sort order arrives as a string from the number input. Must be `.optional()`
 * so a missing key stays valid — RSC serialization strips `undefined` values.
 */
const sortOrder = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((value, ctx) => {
    if (value === "" || value === null || value === undefined) return 0;
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      ctx.addIssue({ code: "custom", message: "Order must be a whole number" });
      return z.NEVER;
    }
    if (n < 0 || n > PARTNER_SORT_ORDER_MAX) {
      ctx.addIssue({
        code: "custom",
        message: `Order must be between 0 and ${PARTNER_SORT_ORDER_MAX}`,
      });
      return z.NEVER;
    }
    return n;
  });

export const partnerFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(PARTNER_NAME_MAX, `Name must be at most ${PARTNER_NAME_MAX} characters`),
  org: z
    .string()
    .trim()
    .max(PARTNER_ORG_MAX, `Organisation must be at most ${PARTNER_ORG_MAX} characters`)
    .refine(
      (value) => value === "" || value.length >= 2,
      "Organisation must be at least 2 characters",
    )
    .optional()
    .or(z.literal("")),
  type: z.enum(PARTNER_TYPES),
  contribution: optionalText(PARTNER_CONTRIBUTION_MAX),
  isActive: z.boolean(),
  logoPermission: z.boolean(),
  link: optionalUrl,
  sortOrder,
});

export const createPartnerSchema = partnerFieldsSchema;

export const updatePartnerSchema = partnerFieldsSchema.extend({
  id: z.uuid("Invalid partner id"),
});

export const deletePartnerSchema = z.object({
  id: z.uuid("Invalid partner id"),
});

export const partnerIdSchema = z.uuid("Invalid partner id");

/** Raw form values before Zod coercion (e.g. `sortOrder` as a string). */
export type PartnerFormValues = z.input<typeof createPartnerSchema>;
export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type DeletePartnerInput = z.infer<typeof deletePartnerSchema>;

const partnerListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  // Every character is allowed: `data/partners.ts` quotes and escapes the term
  // before it reaches PostgREST, so commas, parentheses and ilike wildcards are
  // searched literally instead of silently discarding the whole query.
  search: z.string().trim().max(100).catch(""),
  type: z.enum(["all", ...PARTNER_TYPES]).catch("all"),
  status: z.enum(["all", "active", "historical"]).catch("all"),
});

export type PartnerListQuery = z.infer<typeof partnerListQueryInputSchema> & {
  pageSize: typeof PARTNER_PAGE_SIZE;
};

export function parsePartnerListQuery(
  input: RawSearchParams,
): PartnerListQuery {
  return parseAdminListQuery({
    input,
    schema: partnerListQueryInputSchema,
    pageSize: PARTNER_PAGE_SIZE,
    defaults: { page: "1", search: "", type: "all", status: "all" },
  });
}
