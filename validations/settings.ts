import { z } from "zod";

import { BACKUP_SCHEDULE_VALUES } from "@/lib/backups/schedule";

export const updateSiteSettingsSchema = z.object({
  openApplications: z.boolean(),
  newsletterSignupEnabled: z.boolean(),
  backupTime: z.enum(BACKUP_SCHEDULE_VALUES),
});

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
