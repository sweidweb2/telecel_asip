import { unstable_cache } from "next/cache";

import { createPublicClient } from "@/lib/supabase/public";

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

/** Singleton row id enforced by `site_settings_singleton_chk`. */
export const SITE_SETTINGS_ID = 1;

export type SiteSettingsPublic = {
  openApplications: boolean;
  newsletterSignupEnabled: boolean;
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

export async function getOpenApplications(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.openApplications;
}

export async function getNewsletterSignupEnabled(): Promise<boolean> {
  const settings = await getSiteSettings();
  return settings.newsletterSignupEnabled;
}
