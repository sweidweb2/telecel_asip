import type { Metadata } from "next";

import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { InboxCsvDownloadLink } from "@/components/dashboard/inbox-csv-download-link";
import { InboxStatsCards } from "@/components/dashboard/inbox-stats-cards";
import { InvestorEngagementsTable } from "@/components/investor-engagements/investor-engagements-table";
import { getAdminResource } from "@/constants/admin-resources";
import { getInvestorEngagementsPageData } from "@/data/investor-engagements";
import { parseInvestorEngagementListQuery } from "@/validations/investor-engagement";

const resource = getAdminResource("investorEngagements");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type InvestorEngagementsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function InvestorEngagementsPage({
  searchParams,
}: InvestorEngagementsPageProps) {
  return (
    <CmsListPage
      resourceId="investorEngagements"
      searchParams={searchParams}
      parseQuery={parseInvestorEngagementListQuery}
      fetchPage={getInvestorEngagementsPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        inboxStatus:
          query.inboxStatus !== "inbox" ? query.inboxStatus : undefined,
      })}
      actions={
        <InboxCsvDownloadLink href="/api/admin/export/investor_engagements" />
      }
      stats={(result) => <InboxStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <InvestorEngagementsTable
          engagements={result.list.engagements}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
