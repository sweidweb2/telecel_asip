import type { Metadata } from "next";

import { CohortEditorForm } from "@/components/cohorts/cohort-editor-form";
import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "New cohort | ASIP Editor",
};

export default function NewCohortPage() {
  return (
    <CmsEditorPage
      listPath={ROUTES.cohorts}
      listLabel="Cohorts"
      pageLabel="New cohort"
    >
      <CohortEditorForm mode="create" heading="New cohort" />
    </CmsEditorPage>
  );
}
