import type { Metadata } from "next";
import Link from "next/link";

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
import { requireAdmin } from "@/data/auth";

export const metadata: Metadata = {
  title: "New impact metric | ASIP Admin",
};

export default async function NewImpactMetricPage() {
  await requireAdmin();

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
            <BreadcrumbPage>New metric</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <ImpactMetricEditorForm
        mode="create"
        heading="New impact metric"
        description="Every metric must link to an evidence record. Only verified status should appear on the live site."
      />
    </main>
  );
}
