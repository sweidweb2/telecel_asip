import type { Metadata } from "next";

import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { ImpactMetricEditorForm } from "@/components/impact-metrics/impact-metric-editor-form";
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

  return (
    <CmsEditorPage
      listPath={ROUTES.impactMetrics}
      listLabel="Impact metrics"
      load={() => getImpactMetricByIdForAdmin(id)}
      pageLabel={(record) =>
        record.metric.claim_label.trim() || "Edit metric"
      }
    >
      {(record) => (
        <ImpactMetricEditorForm
          mode="edit"
          metric={record.metric}
          heading="Edit impact metric"
        />
      )}
    </CmsEditorPage>
  );
}
