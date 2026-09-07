import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ImpactMetricEditorForm } from "@/components/impact-metrics/impact-metric-editor-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTES } from "@/constants/routes";
import { getImpactMetricByIdForAdmin } from "@/data/impact-metrics";

type EditImpactMetricPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditImpactMetricPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getImpactMetricByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Impact metric | ASIP Admin" };
  }
  return { title: `${result.metric.claim_label} | ASIP Admin` };
}

export default async function EditImpactMetricPage({
  params,
}: EditImpactMetricPageProps) {
  const { id } = await params;
  const result = await getImpactMetricByIdForAdmin(id);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);
  if (result.status === "not_found") notFound();

  const pageLabel = result.metric.claim_label.trim() || "Edit metric";

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
              {pageLabel}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ImpactMetricEditorForm
        mode="edit"
        metric={result.metric}
        heading="Edit impact metric"
      />
    </main>
  );
}
