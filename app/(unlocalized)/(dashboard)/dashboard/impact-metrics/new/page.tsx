import type { Metadata } from "next";

import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { ImpactMetricEditorForm } from "@/components/impact-metrics/impact-metric-editor-form";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "New impact metric | ASIP Editor",
};

export default function NewImpactMetricPage() {
  return (
    <CmsEditorPage
      listPath={ROUTES.impactMetrics}
      listLabel="Impact metrics"
      pageLabel="New metric"
    >
      <ImpactMetricEditorForm mode="create" heading="New impact metric" />
    </CmsEditorPage>
  );
}
