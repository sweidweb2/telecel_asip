import { z } from "zod";

import { BACKUP_SCHEDULE_VALUES } from "@/constants/backup-schedule";

export const updateEditorSiteSettingsSchema = z.object({
  openApplications: z.boolean(),
  newsletterSignupEnabled: z.boolean(),
});

export const updateAdminSiteSettingsSchema = updateEditorSiteSettingsSchema.extend({
  /** Full DB enum so a stored daily_* can be re-saved unchanged; UI only offers Off + weekly (+ legacy). */
  backupTime: z.enum(BACKUP_SCHEDULE_VALUES),
});

/** @deprecated Prefer updateEditorSiteSettingsSchema / updateAdminSiteSettingsSchema. */
export const updateSiteSettingsSchema = updateAdminSiteSettingsSchema;

export type UpdateEditorSiteSettingsInput = z.infer<
  typeof updateEditorSiteSettingsSchema
>;
export type UpdateAdminSiteSettingsInput = z.infer<
  typeof updateAdminSiteSettingsSchema
>;
export type UpdateSiteSettingsInput = UpdateAdminSiteSettingsInput;
