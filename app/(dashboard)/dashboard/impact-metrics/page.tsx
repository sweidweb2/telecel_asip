import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { ImpactMetricFormDialog } from "@/components/impact-metrics/impact-metric-form-dialog";
import { ImpactMetricsTable } from "@/components/impact-metrics/impact-metrics-table";
import { getAdminResource } from "@/constants/admin-resources";
import { getImpactMetricsPageData } from "@/data/impact-metrics";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseImpactMetricListQuery } from "@/validations/impact-metric";

const resource = getAdminResource("impactMetrics");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type ImpactMetricsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ImpactMetricsPage({
  searchParams,
}: ImpactMetricsPageProps) {
  const query = parseImpactMetricListQuery(await searchParams);
  const { list } = await loadAdminListPage({
    query,
    fetchPage: getImpactMetricsPageData,
    listPath: resource.listPath,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, {
        search: q.search || undefined,
        lens: q.lens !== "all" ? q.lens : undefined,
        publishStatus:
          q.publishStatus !== "all" ? q.publishStatus : undefined,
      }),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      description={resource.description}
      actions={<ImpactMetricFormDialog mode="create" />}
    >
      <ImpactMetricsTable
        metrics={list.metrics}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
