import type { Metadata } from "next";

import { SettingsPageContent } from "@/components/settings/settings-page-content";
import { requireAdmin } from "@/data/auth";
import { getSiteSettingsForAdmin } from "@/data/settings";

export const metadata: Metadata = {
  title: "Settings | ASIP Admin",
};

export default async function AdminSettingsPage() {
  await requireAdmin();

  const settings = await getSiteSettingsForAdmin();

  return (
    <SettingsPageContent
      openApplications={settings.openApplications}
      newsletterSignupEnabled={settings.newsletterSignupEnabled}
    />
  );
}
