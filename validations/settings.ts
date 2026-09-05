import { z } from "zod";

export const updateSiteSettingsSchema = z.object({
  openApplications: z.boolean(),
  newsletterSignupEnabled: z.boolean(),
});

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
