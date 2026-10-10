import type { Metadata } from "next";

import { CohortsTable } from "@/components/cohorts/cohorts-table";
import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { CohortStatsCards } from "@/components/dashboard/cms-list-stats";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getCohortsPageData } from "@/data/cohorts";
import { parseCohortListQuery } from "@/validations/cohort";

const resource = getAdminResource("cohorts");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type CohortsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function CohortsPage({ searchParams }: CohortsPageProps) {
  return (
    <CmsListPage
      resourceId="cohorts"
      searchParams={searchParams}
      parseQuery={parseCohortListQuery}
      fetchPage={getCohortsPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        status: query.status !== "all" ? query.status : undefined,
      })}
      newItem={{ href: ROUTES.cohortsNew, label: "New cohort" }}
      showPublicReflection
      stats={(result) => <CohortStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <CohortsTable
          cohorts={result.list.cohorts}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
