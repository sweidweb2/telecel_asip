"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { LOCALES } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { SITE_SETTINGS_CACHE_TAG, SITE_SETTINGS_ID } from "@/data/settings";
import { authorizeAdmin } from "@/lib/admin/authorize-admin";
import { authorizeStaff } from "@/lib/admin/authorize-staff";
import {
  updateAdminSiteSettingsSchema,
  updateEditorSiteSettingsSchema,
  type UpdateAdminSiteSettingsInput,
  type UpdateEditorSiteSettingsInput,
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
  backupUnauthorized: "Only administrators can change the backup schedule.",
} as const;

/** Pages whose own render reads site settings. Not the locale layout. */
const SETTINGS_PUBLIC_PATHS = [
  "",
  "/programme",
  "/apply",
  "/register-interest",
  "/login",
  "/signup",
] as const;

function revalidateSettingsCaches() {
  revalidateTag(SITE_SETTINGS_CACHE_TAG, "max");
  for (const locale of LOCALES) {
    for (const path of SETTINGS_PUBLIC_PATHS) {
      revalidatePath(`/${locale}${path}`);
    }
  }
  revalidatePath("/sitemap.xml");
  revalidatePath(ROUTES.settings);
  revalidatePath(ROUTES.adminSettings);
  revalidatePath(ROUTES.adminBackup);
}

/** Editors and admins may toggle applications / newsletter. */
export async function updateEditorSiteSettings(
  input: UpdateEditorSiteSettingsInput,
): Promise<SiteSettingsActionResult> {
  const parsed = updateEditorSiteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const auth = await authorizeStaff(MESSAGES);
  if (auth.status === "error") return auth;

  const { data, error } = await auth.supabase
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

  revalidateSettingsCaches();
  return { status: "success", message: MESSAGES.updateSuccess };
}

/** Admins may also set backup_time (and applications for sole-admin ops). */
export async function updateAdminSiteSettings(
  input: UpdateAdminSiteSettingsInput,
): Promise<SiteSettingsActionResult> {
  const parsed = updateAdminSiteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { status: "error", message: MESSAGES.invalidDetails };
  }

  const auth = await authorizeAdmin(MESSAGES);
  if (auth.status === "error") {
    return {
      status: "error",
      message:
        auth.message === MESSAGES.unauthorized
          ? MESSAGES.backupUnauthorized
          : auth.message,
    };
  }

  const { data, error } = await auth.supabase
    .from("site_settings")
    .update({
      open_applications: parsed.data.openApplications,
      newsletter_signup_enabled: parsed.data.newsletterSignupEnabled,
      backup_time: parsed.data.backupTime,
    })
    .eq("id", SITE_SETTINGS_ID)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return { status: "error", message: MESSAGES.genericError };
  }

  revalidateSettingsCaches();
  return { status: "success", message: MESSAGES.updateSuccess };
}
