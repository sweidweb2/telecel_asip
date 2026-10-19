import type { Metadata } from "next";

import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { ImpactMetricStatsCards } from "@/components/dashboard/cms-list-stats";
import { ImpactMetricsTable } from "@/components/impact-metrics/impact-metrics-table";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getImpactMetricsPageData } from "@/data/impact-metrics";
import { parseImpactMetricListQuery } from "@/validations/impact-metric";

const resource = getAdminResource("impactMetrics");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type ImpactMetricsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function ImpactMetricsPage({
  searchParams,
}: ImpactMetricsPageProps) {
  return (
    <CmsListPage
      resourceId="impactMetrics"
      searchParams={searchParams}
      parseQuery={parseImpactMetricListQuery}
      fetchPage={getImpactMetricsPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        lens: query.lens !== "all" ? query.lens : undefined,
        publishStatus:
          query.publishStatus !== "all" ? query.publishStatus : undefined,
      })}
      newItem={{ href: ROUTES.impactMetricsNew, label: "New metric" }}
      stats={(result) => <ImpactMetricStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <ImpactMetricsTable
          metrics={result.list.metrics}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
