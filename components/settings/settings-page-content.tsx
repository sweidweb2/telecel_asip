import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { SiteSettingsForm } from "@/components/settings/site-settings-form";

type SettingsPageContentProps = {
  openApplications: boolean;
};

/** Shared Settings form chrome for the editor and admin shells. */
export function SettingsPageContent({
  openApplications,
}: SettingsPageContentProps) {
  return (
    <AdminListPageShell title="Settings">
      <SiteSettingsForm openApplications={openApplications} />
    </AdminListPageShell>
  );
}
