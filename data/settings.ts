import { unstable_cache } from "next/cache";

import { createPublicClient } from "@/lib/supabase/public";

export const SITE_SETTINGS_CACHE_TAG = "site-settings";

/** Singleton row id enforced by `site_settings_singleton_chk`. */
export const SITE_SETTINGS_ID = 1;

async function fetchOpenApplications(): Promise<boolean> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("open_applications")
    .eq("id", SITE_SETTINGS_ID)
    .maybeSingle();

  // Read on every marketing layout render: a Supabase outage must not take the
  // navbar down, and "closed" is the safe default for an unconfirmed cohort.
  if (error) return false;
  return Boolean(data?.open_applications);
}

export const getOpenApplications = unstable_cache(
  fetchOpenApplications,
  ["site-settings-open-applications"],
  { tags: [SITE_SETTINGS_CACHE_TAG], revalidate: 60 },
);
