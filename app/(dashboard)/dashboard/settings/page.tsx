import type { Metadata } from "next";

import { SiteSettingsForm } from "@/components/settings/site-settings-form";
import { requireAdmin } from "@/data/auth";
import { getSiteSettings } from "@/data/settings";

export const metadata: Metadata = {
  title: "Settings | ASIP Admin",
};

export default async function SettingsPage() {
  await requireAdmin();

  const settings = await getSiteSettings();

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="min-w-0">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Control site-wide switches that change what the public site shows.
        </p>
      </div>

      <SiteSettingsForm
        openApplications={settings.openApplications}
        newsletterSignupEnabled={settings.newsletterSignupEnabled}
      />
    </main>
  );
}
