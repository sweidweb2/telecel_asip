import type { Metadata } from "next";

import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { InboxCsvDownloadLink } from "@/components/dashboard/inbox-csv-download-link";
import { InboxStatsCards } from "@/components/dashboard/inbox-stats-cards";
import { InvestorInterestsTable } from "@/components/investor-interests/investor-interests-table";
import { getAdminResource } from "@/constants/admin-resources";
import { getInvestorInterestsPageData } from "@/data/investor-interests";
import { parseInvestorInterestListQuery } from "@/validations/investor-interest";

const resource = getAdminResource("investorInterests");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type InvestorInterestsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function InvestorInterestsPage({
  searchParams,
}: InvestorInterestsPageProps) {
  return (
    <CmsListPage
      resourceId="investorInterests"
      searchParams={searchParams}
      parseQuery={parseInvestorInterestListQuery}
      fetchPage={getInvestorInterestsPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        inboxStatus:
          query.inboxStatus !== "inbox" ? query.inboxStatus : undefined,
      })}
      actions={
        <InboxCsvDownloadLink href="/api/admin/export/investor_interests" />
      }
      stats={(result) => <InboxStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <InvestorInterestsTable
          interests={result.list.interests}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
