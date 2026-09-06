import { unstable_cache } from "next/cache";

import type { BackupScheduleValue } from "@/lib/backups/schedule";
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

async function fetchSiteSettings(): Promise<SiteSettingsPublic> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
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

/**
 * Uncached read for the admin Settings form so the editor always sees the
 * live row after navigation (public marketing still uses the 60s cache).
 * Includes backup_time (admin UI only — cron uses createAdminClient).
 */
export async function getSiteSettingsForAdmin(): Promise<SiteSettingsAdmin> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("open_applications, newsletter_signup_enabled, backup_time")
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  if (error || !data) {
    return {
      openApplications: false,
      newsletterSignupEnabled: false,
      backupTime: "weekly_sun_03",
    };
  }

  return {
    openApplications: Boolean(data.open_applications),
    newsletterSignupEnabled: Boolean(data.newsletter_signup_enabled),
    backupTime: data.backup_time as BackupScheduleValue,
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
