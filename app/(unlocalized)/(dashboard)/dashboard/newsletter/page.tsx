import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { InboxCsvDownloadLink } from "@/components/dashboard/inbox-csv-download-link";
import { NewsletterSubscribersTable } from "@/components/newsletter/newsletter-subscribers-table";
import { getAdminResource } from "@/constants/admin-resources";
import { getNewsletterSubscribersPageData } from "@/data/newsletter-subscribers";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseNewsletterListQuery } from "@/validations/newsletter";

const resource = getAdminResource("newsletter");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type NewsletterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Staff list + CSV for newsletter opt-ins.
 * Public signup stays phase-1 hidden; transactional email (Resend/etc.) is not wired.
 */
export default async function NewsletterPage({
  searchParams,
}: NewsletterPageProps) {
  const query = parseNewsletterListQuery(await searchParams);
  const { list } = await loadAdminListPage({
    query,
    fetchPage: getNewsletterSubscribersPageData,
    listPath: resource.listPath,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, {
        search: q.search || undefined,
      }),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      actions={
        <InboxCsvDownloadLink href="/api/admin/export/newsletter_subscribers" />
      }
    >
      <NewsletterSubscribersTable
        subscribers={list.subscribers}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
