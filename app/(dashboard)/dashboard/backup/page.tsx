import type { Metadata } from "next";
import { DownloadIcon } from "lucide-react";

import { BackupCreateForm } from "@/components/dashboard/backup-create-form";
import { BackupHistoryTable } from "@/components/dashboard/backup-history-table";
import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import { getBackupsPageData } from "@/data/backups";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { cn } from "@/lib/utils";
import {
  backupListFilterParams,
  parseBackupListQuery,
} from "@/validations/backup";

export const metadata: Metadata = {
  title: "Backup | ASIP Admin",
};

const EXPORTS = [
  {
    title: "Applications",
    description: "Official Apply submissions with inbox status.",
    href: "/api/admin/export/applications",
  },
  {
    title: "Interest registrations",
    description: "Register Interest leads with inbox status.",
    href: "/api/admin/export/interest_registrations",
  },
  {
    title: "Contact messages",
    description: "Public contact form messages with inbox status.",
    href: "/api/admin/export/contact_messages",
  },
] as const;

type BackupPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BackupPage({ searchParams }: BackupPageProps) {
  const query = parseBackupListQuery(await searchParams);
  const result = await loadAdminListPage({
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
    listPath: ROUTES.backup,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, backupListFilterParams(q)),
  });

  return (
    <AdminListPageShell title="Backup">
      <div className="grid gap-10">
        <BackupCreateForm />

        <BackupHistoryTable
          backups={result.list.backups}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />

        <section className="grid gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Quick CSV
          </h2>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {EXPORTS.map((item) => (
              <li key={item.href}>
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    <a
                      href={item.href}
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "min-h-11 w-full sm:w-auto",
                      )}
                    >
                      <DownloadIcon className="size-4" />
                      Download CSV
                    </a>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            Recovery
          </h2>
          <Card>
            <CardContent className="grid gap-4 pt-6 text-sm text-muted-foreground">
              <p>
                In-app and scheduled R2 backups are operational copies for export —
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
