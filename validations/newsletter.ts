import { z } from "zod";

import {
  parseAdminListQuery,
  type RawSearchParams,
} from "@/validations/admin-list-query";

export const NEWSLETTER_PAGE_SIZE = 20;

const newsletterListQueryInputSchema = z.object({
  page: z.coerce.number().int().min(1).catch(1),
  search: z
    .string()
    .trim()
    .max(100, "Search must be 100 characters or fewer")
    .regex(/^[^,%_()]*$/, "Search contains unsupported characters")
    .catch(""),
});

export type NewsletterListQuery = z.infer<
  typeof newsletterListQueryInputSchema
> & {
  pageSize: typeof NEWSLETTER_PAGE_SIZE;
};

export function parseNewsletterListQuery(
  input: RawSearchParams,
): NewsletterListQuery {
  return parseAdminListQuery({
    input,
    schema: newsletterListQueryInputSchema,
    pageSize: NEWSLETTER_PAGE_SIZE,
    defaults: { page: "1", search: "" },
  });
}

export const newsletterSubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3, "Enter a valid email address")
    .max(254, "Email must be at most 254 characters")
    .pipe(z.email("Enter a valid email address")),
  consent: z.boolean().refine((value) => value === true, {
    message: "Consent is required to subscribe",
  }),
  sourcePage: z
    .union([z.string().trim().max(120), z.null()])
    .transform((value) => {
      if (value == null) return null;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }),
});

export type NewsletterSubscribeInput = z.infer<
  typeof newsletterSubscribeSchema
>;
