import { unstable_cache } from "next/cache";

import type { BackupScheduleValue } from "@/constants/backup-schedule";
import { isCurrentUserAdmin } from "@/lib/admin/is-current-user-admin";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

/** Singleton row id enforced by `site_settings_singleton_chk`. */
export const SITE_SETTINGS_ID = 1;

export type SiteSettingsPublic = {
  openApplications: boolean;
  newsletterSignupEnabled: boolean;
};

export type SiteSettingsAdmin = SiteSettingsPublic & {
  backupTime: BackupScheduleValue;
};

const DEFAULT_BACKUP_TIME: BackupScheduleValue = "weekly_sun_03";

async function fetchSiteSettings(): Promise<SiteSettingsPublic> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings_public")
    .select("open_applications, newsletter_signup_enabled")
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  // Safe defaults: applications closed, newsletter off.
  if (error || !data) {
    return { openApplications: false, newsletterSignupEnabled: false };
  }

  return {
    openApplications: Boolean(data.open_applications),
    newsletterSignupEnabled: Boolean(data.newsletter_signup_enabled),
  };
}

const getSiteSettingsCached = unstable_cache(
  fetchSiteSettings,
  ["site-settings"],
  { tags: [SITE_SETTINGS_CACHE_TAG], revalidate: 60 },
);

export async function getSiteSettings(): Promise<SiteSettingsPublic> {
  return getSiteSettingsCached();
}

async function fetchAdminBackupSchedule(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<BackupScheduleValue> {
  const { data, error } = await supabase.rpc("get_admin_backup_schedule");
  if (error || !data) return DEFAULT_BACKUP_TIME;
  return data as BackupScheduleValue;
}

/**
 * Uncached staff read for Settings / Backup forms.
 * Flags come from the base table (no backup_time column grant).
 * backup_time is loaded only for admins via get_admin_backup_schedule.
 */
export async function getSiteSettingsForAdmin(): Promise<SiteSettingsAdmin> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("open_applications, newsletter_signup_enabled")
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  if (error || !data) {
    return {
      openApplications: false,
      newsletterSignupEnabled: false,
      backupTime: DEFAULT_BACKUP_TIME,
    };
  }

  const backupTime = (await isCurrentUserAdmin())
    ? await fetchAdminBackupSchedule(supabase)
    : DEFAULT_BACKUP_TIME;

  return {
    openApplications: Boolean(data.open_applications),
    newsletterSignupEnabled: Boolean(data.newsletter_signup_enabled),
    backupTime,
  };
}

export async function getOpenApplications(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.openApplications;
}

export async function getNewsletterSignupEnabled(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.newsletterSignupEnabled;
}
