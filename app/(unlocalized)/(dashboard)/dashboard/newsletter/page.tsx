import type { Metadata } from "next";

import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { InboxCsvDownloadLink } from "@/components/dashboard/inbox-csv-download-link";
import { NewsletterSubscribersTable } from "@/components/newsletter/newsletter-subscribers-table";
import { getAdminResource } from "@/constants/admin-resources";
import { getNewsletterSubscribersPageData } from "@/data/newsletter-subscribers";
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
export default function NewsletterPage({ searchParams }: NewsletterPageProps) {
  return (
    <CmsListPage
      resourceId="newsletter"
      searchParams={searchParams}
      parseQuery={parseNewsletterListQuery}
      fetchPage={getNewsletterSubscribersPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
      })}
      actions={
        <InboxCsvDownloadLink href="/api/admin/export/newsletter_subscribers" />
      }
    >
      {({ query, result }) => (
        <NewsletterSubscribersTable
          subscribers={result.list.subscribers}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
