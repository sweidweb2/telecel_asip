import type { Metadata } from "next";

import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { InboxCsvDownloadLink } from "@/components/dashboard/inbox-csv-download-link";
import { InboxStatsCards } from "@/components/dashboard/inbox-stats-cards";
import { RegistrationsTable } from "@/components/registrations/registrations-table";
import { getAdminResource } from "@/constants/admin-resources";
import { getInterestRegistrationsPageData } from "@/data/interest-registrations";
import { parseInterestRegistrationListQuery } from "@/validations/interest-registration";

const resource = getAdminResource("registrations");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type RegistrationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function RegistrationsPage({
  searchParams,
}: RegistrationsPageProps) {
  return (
    <CmsListPage
      resourceId="registrations"
      searchParams={searchParams}
      parseQuery={parseInterestRegistrationListQuery}
      fetchPage={getInterestRegistrationsPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        inboxStatus:
          query.inboxStatus !== "inbox" ? query.inboxStatus : undefined,
      })}
      actions={
        <InboxCsvDownloadLink href="/api/admin/export/interest_registrations" />
      }
      stats={(result) => <InboxStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <RegistrationsTable
          registrations={result.list.registrations}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
