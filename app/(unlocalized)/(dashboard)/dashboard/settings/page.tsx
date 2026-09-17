import type { Metadata } from "next";

import { SettingsPageContent } from "@/components/settings/settings-page-content";
import { requireEditor } from "@/data/auth";
import { getSiteSettingsForAdmin } from "@/data/settings";

export const metadata: Metadata = {
  title: "Settings | ASIP Editor",
};

export default async function SettingsPage() {
  await requireEditor();

  const settings = await getSiteSettingsForAdmin();

  return (
    <SettingsPageContent
      openApplications={settings.openApplications}
      newsletterSignupEnabled={settings.newsletterSignupEnabled}
    />
  );
}
