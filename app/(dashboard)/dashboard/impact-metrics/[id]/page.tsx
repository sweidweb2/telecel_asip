import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ImpactMetricDetailContent } from "@/components/impact-metrics/impact-metric-detail-content";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTES } from "@/constants/routes";
import {
  getImpactMetricByIdForAdmin,
  listEvidenceOptionsForAdmin,
} from "@/data/impact-metrics";

type ImpactMetricDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ImpactMetricDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getImpactMetricByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Impact metric | ASIP Admin" };
  }
  return { title: `${result.metric.claim_label} | ASIP Admin` };
}

export default async function ImpactMetricDetailPage({
  params,
}: ImpactMetricDetailPageProps) {
  const { id } = await params;
  const [result, evidenceResult] = await Promise.all([
    getImpactMetricByIdForAdmin(id),
    listEvidenceOptionsForAdmin(),
  ]);

  if (result.status === "forbidden" || evidenceResult.status === "forbidden") {
    redirect(ROUTES.dashboard);
  }
  if (result.status === "not_found") notFound();

  const evidencePrimarySource =
    evidenceResult.options.find(
      (option) => option.id === result.metric.evidence_id,
    )?.primary_source ?? null;

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.impactMetrics} />}>
              Impact metrics
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[16rem] truncate sm:max-w-md">
              {result.metric.claim_label}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ImpactMetricDetailContent
        metric={result.metric}
        evidenceOptions={evidenceResult.options}
        evidencePrimarySource={evidencePrimarySource}
      />
    </main>
  );
}
