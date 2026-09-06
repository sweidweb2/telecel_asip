import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { ImpactMetricStatsCards } from "@/components/dashboard/cms-list-stats";
import { ImpactMetricsTable } from "@/components/impact-metrics/impact-metrics-table";
import { Button } from "@/components/ui/button";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
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
  const { list, stats } = await loadAdminListPage({
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
      actions={
        <Button
          className="min-h-11 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href={ROUTES.impactMetricsNew} />}
        >
          <PlusIcon className="size-4" />
          New metric
        </Button>
      }
    >
      <ImpactMetricStatsCards stats={stats} />
      <ImpactMetricsTable
        metrics={list.metrics}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
