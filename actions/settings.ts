"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants/routes";
import { SITE_SETTINGS_CACHE_TAG, SITE_SETTINGS_ID } from "@/data/settings";
import { createClient } from "@/lib/supabase/server";
import {
  updateSiteSettingsSchema,
  type UpdateSiteSettingsInput,
} from "@/validations/settings";

export type SiteSettingsActionResult =
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const MESSAGES = {
  invalidDetails: "Please check the form and try again.",
  updateSuccess: "Settings saved.",
  genericError: "Something went wrong. Please try again.",
  unauthorized: "You do not have permission to change site settings.",
  signedInRequired: "You must be signed in.",
} as const;

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput,
): Promise<SiteSettingsActionResult> {
  const parsed = updateSiteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { status: "error", message: MESSAGES.signedInRequired };
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError || !isAdmin) {
    return { status: "error", message: MESSAGES.unauthorized };
  }

  const { data, error } = await supabase
    .from("site_settings")
    .update({
      open_applications: parsed.data.openApplications,
      newsletter_signup_enabled: parsed.data.newsletterSignupEnabled,
    })
    .eq("id", SITE_SETTINGS_ID)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { status: "error", message: MESSAGES.genericError };
  }

  revalidateTag(SITE_SETTINGS_CACHE_TAG, "max");
  // The CTA lives in both marketing layouts, so refresh the whole public tree.
  revalidatePath("/", "layout");
  revalidatePath("/en/insights");
  revalidatePath("/fr/insights");
  revalidatePath(ROUTES.settings);

  return { status: "success", message: MESSAGES.updateSuccess };
}
