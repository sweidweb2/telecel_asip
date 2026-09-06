import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { SiteSettingsForm } from "@/components/settings/site-settings-form";
import { requireAdmin } from "@/data/auth";
import { getSiteSettingsForAdmin } from "@/data/settings";

export const metadata: Metadata = {
  title: "Settings | ASIP Admin",
};

export default async function SettingsPage() {
  await requireAdmin();

  const settings = await getSiteSettingsForAdmin();

  return (
    <AdminListPageShell
      title="Settings"
    >
      <SiteSettingsForm
        openApplications={settings.openApplications}
        newsletterSignupEnabled={settings.newsletterSignupEnabled}
      />
    </AdminListPageShell>
  );
}
