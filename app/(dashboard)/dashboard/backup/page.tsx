import type { Metadata } from "next";
import { DownloadIcon } from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/data/auth";
import { cn } from "@/lib/utils";

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

export default async function BackupPage() {
  await requireAdmin();

  return (
    <AdminListPageShell
      title="Backup"
      description="Download intake CSVs and follow recovery notes for the database."
    >
      <div className="grid gap-8">
        <section className="grid gap-3">
          <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            CSV export
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
                Database backups and point-in-time recovery run in Supabase, not
                inside this admin UI. Use the project dashboard for restore
                operations.
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Confirm automated backups / PITR are enabled for the linked
                  Supabase project.
                </li>
                <li>
                  Keep a credentials and secrets handover list outside the app
                  (env vars, service role, Turnstile, storage).
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
