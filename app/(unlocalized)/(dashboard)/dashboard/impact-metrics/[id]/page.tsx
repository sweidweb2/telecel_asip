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
import { StaffMain } from "@/components/dashboard/skip-to-content";
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
    return { title: "Impact metric | ASIP Editor" };
  }
  return { title: `${result.metric.claim_label} | ASIP Editor` };
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
    <StaffMain>
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
    </StaffMain>
  );
}
