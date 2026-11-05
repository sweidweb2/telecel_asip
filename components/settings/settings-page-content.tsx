import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { SiteSettingsForm } from "@/components/settings/site-settings-form";

type SettingsPageContentProps = {
  openApplications: boolean;
  newsletterSignupEnabled: boolean;
};

/** Shared Settings form chrome for the editor and admin shells. */
export function SettingsPageContent({
  openApplications,
  newsletterSignupEnabled,
}: SettingsPageContentProps) {
  return (
    <AdminListPageShell title="Settings">
      <p className="text-sm text-muted-foreground">
        Same site-wide intake switches for editors and admins, not two
        different settings products.
      </p>
      <SiteSettingsForm
        openApplications={openApplications}
        newsletterSignupEnabled={newsletterSignupEnabled}
      />
    </AdminListPageShell>
  );
}
