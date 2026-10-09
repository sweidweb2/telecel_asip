import type { Metadata } from "next";

import { ApplicationsTable } from "@/components/applications/applications-table";
import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { InboxCsvDownloadLink } from "@/components/dashboard/inbox-csv-download-link";
import { InboxStatsCards } from "@/components/dashboard/inbox-stats-cards";
import { getAdminResource } from "@/constants/admin-resources";
import { getApplicationsPageData } from "@/data/applications";
import { parseApplicationListQuery } from "@/validations/application";

const resource = getAdminResource("applications");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type ApplicationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  return (
    <CmsListPage
      resourceId="applications"
      searchParams={searchParams}
      parseQuery={parseApplicationListQuery}
      fetchPage={getApplicationsPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        inboxStatus:
          query.inboxStatus !== "inbox" ? query.inboxStatus : undefined,
      })}
      actions={<InboxCsvDownloadLink href="/api/admin/export/applications" />}
      stats={(result) => <InboxStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <ApplicationsTable
          applications={result.list.applications}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
