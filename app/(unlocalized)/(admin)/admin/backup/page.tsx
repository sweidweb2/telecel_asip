import type { Metadata } from "next";

import { BackupCreateForm } from "@/components/dashboard/backup-create-form";
import { BackupHistoryTable } from "@/components/dashboard/backup-history-table";
import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { AdminSectionHeading } from "@/components/dashboard/admin-section-heading";
import { AdminBackupSettingsForm } from "@/components/settings/admin-backup-settings-form";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { getBackupsPageData } from "@/data/backups";
import { getSiteSettingsForAdmin } from "@/data/settings";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import {
  backupListFilterParams,
  parseBackupListQuery,
} from "@/validations/backup";

export const metadata: Metadata = {
  title: "Backup | ASIP Admin",
};

/** Align with cron backup route — Full/Storage exports can take minutes. */
export const maxDuration = 300;

type BackupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BackupPage({ searchParams }: BackupPageProps) {
  const query = parseBackupListQuery(await searchParams);
  const [result, settings] = await Promise.all([
    loadAdminListPage({
      query,
      fetchPage: async (q) => {
        const page = await getBackupsPageData(q);
        if (page.status === "forbidden") return page;
        return {
          status: "ok" as const,
          list: {
            backups: page.backups,
            total: page.total,
            totalPages: page.totalPages,
          },
        };
      },
      listPath: ROUTES.adminBackup,
      buildClampParams: (q, totalPages) =>
        adminListClampParams(totalPages, backupListFilterParams(q)),
    }),
    getSiteSettingsForAdmin(),
  ]);

  return (
    <AdminListPageShell title="Backup">
      <div className="grid gap-8">
        <BackupCreateForm />

        <section className="grid gap-3">
          <AdminSectionHeading>Schedule</AdminSectionHeading>
          <AdminBackupSettingsForm
            openApplications={settings.openApplications}
            newsletterSignupEnabled={settings.newsletterSignupEnabled}
            backupTime={settings.backupTime}
          />
        </section>

        <BackupHistoryTable
          backups={result.list.backups}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />

        <section className="grid gap-3 opacity-90">
          <AdminSectionHeading>Recovery</AdminSectionHeading>
          <Card className="border-dashed">
            <CardContent className="grid gap-4 pt-6 text-sm text-muted-foreground">
              <p>
                In-app and scheduled R2 backups are operational copies for export -
                they are not a substitute for Supabase automated backups or
                point-in-time recovery. Use the Supabase project dashboard for
                restore operations.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Confirm automated backups / PITR are enabled for the linked
                  Supabase project.
                </li>
                <li>
                  Keep credentials and secrets outside the app (env vars,
                  service role, R2 keys, Turnstile).
                </li>
                <li>
                  After a restore, re-check CMS lists and public forms before
                  declaring the site healthy.
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminListPageShell>
  );
}
