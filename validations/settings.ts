import { z } from "zod";

import { BACKUP_SCHEDULE_VALUES } from "@/constants/backup-schedule";

export const updateSiteSettingsSchema = z.object({
  openApplications: z.boolean(),
  newsletterSignupEnabled: z.boolean(),
  /** Full DB enum so a stored daily_* can be re-saved unchanged; UI only offers Off + weekly (+ legacy). */
  backupTime: z.enum(BACKUP_SCHEDULE_VALUES),
});

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsSchema>;
