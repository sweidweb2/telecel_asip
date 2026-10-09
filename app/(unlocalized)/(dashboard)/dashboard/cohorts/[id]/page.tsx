import type { Metadata } from "next";

import { CohortEditorForm } from "@/components/cohorts/cohort-editor-form";
import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { ROUTES } from "@/constants/routes";
import { getCohortByIdForAdmin } from "@/data/cohorts";

type EditCohortPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditCohortPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCohortByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Cohort | ASIP Editor" };
  }
  return { title: `${result.cohort.public_label} | ASIP Editor` };
}

export default async function EditCohortPage({ params }: EditCohortPageProps) {
  const { id } = await params;

  return (
    <CmsEditorPage
      listPath={ROUTES.cohorts}
      listLabel="Cohorts"
      load={() => getCohortByIdForAdmin(id)}
      pageLabel={(record) => record.cohort.public_label.trim() || "Edit cohort"}
    >
      {(record) => (
        <CohortEditorForm
          mode="edit"
          cohort={record.cohort}
          heading="Edit cohort"
        />
      )}
    </CmsEditorPage>
  );
}
