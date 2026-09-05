import { z } from "zod";

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
  turnstileToken: z
    .string()
    .trim()
    .min(1, "Complete the security check")
    .max(2048),
});

export type NewsletterSubscribeInput = z.infer<
  typeof newsletterSubscribeSchema
>;
