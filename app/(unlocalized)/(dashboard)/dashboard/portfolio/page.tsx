import type { Metadata } from "next";

import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { StartupStatsCards } from "@/components/dashboard/cms-list-stats";
import { StartupsTable } from "@/components/startups/startups-table";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getStartupsPageData } from "@/data/startups";
import { parseStartupListQuery } from "@/validations/startup";

const resource = getAdminResource("portfolio");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type PortfolioPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function PortfolioAdminPage({
  searchParams,
}: PortfolioPageProps) {
  return (
    <CmsListPage
      resourceId="portfolio"
      searchParams={searchParams}
      parseQuery={parseStartupListQuery}
      fetchPage={getStartupsPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        status: query.status !== "all" ? query.status : undefined,
      })}
      newItem={{ href: ROUTES.portfolioNew, label: "New startup" }}
      showPublicReflection
      stats={(result) => <StartupStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <StartupsTable
          startups={result.list.startups}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
