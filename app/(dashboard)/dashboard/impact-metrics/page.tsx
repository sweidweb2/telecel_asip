import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ImpactMetricFormDialog } from "@/components/impact-metrics/impact-metric-form-dialog";
import { ImpactMetricsTable } from "@/components/impact-metrics/impact-metrics-table";
import { ROUTES } from "@/constants/routes";
import {
  getImpactMetricsPageData,
  listEvidenceOptionsForAdmin,
} from "@/data/impact-metrics";
import { parseImpactMetricListQuery } from "@/validations/impact-metric";

export const metadata: Metadata = {
  title: "Impact metrics | ASIP Admin",
};

type ImpactMetricsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ImpactMetricsPage({
  searchParams,
}: ImpactMetricsPageProps) {
  const query = parseImpactMetricListQuery(await searchParams);
  const [result, evidenceResult] = await Promise.all([
    getImpactMetricsPageData(query),
    listEvidenceOptionsForAdmin(),
  ]);

  if (result.status === "forbidden" || evidenceResult.status === "forbidden") {
    redirect(ROUTES.dashboard);
  }

  const { list } = result;
  const evidenceOptions = evidenceResult.options;

  if (query.page > list.totalPages) {
    const params = new URLSearchParams({ page: String(list.totalPages) });
    if (query.search) params.set("search", query.search);
    if (query.lens !== "all") params.set("lens", query.lens);
    if (query.publishStatus !== "all") {
      params.set("publishStatus", query.publishStatus);
    }
    redirect(`${ROUTES.impactMetrics}?${params.toString()}`);
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Impact metrics
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Evidence-backed claims for Home and Impact. Only verified metrics
            may go live later.
          </p>
        </div>
        <ImpactMetricFormDialog
          mode="create"
          evidenceOptions={evidenceOptions}
        />
      </div>

      <ImpactMetricsTable
        metrics={list.metrics}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
        evidenceOptions={evidenceOptions}
      />
    </main>
  );
}
