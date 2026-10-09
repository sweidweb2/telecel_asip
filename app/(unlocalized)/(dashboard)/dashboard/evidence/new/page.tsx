import type { Metadata } from "next";

import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { EvidenceEditorForm } from "@/components/evidence-records/evidence-editor-form";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "New evidence | ASIP Editor",
};

export default function NewEvidencePage() {
  return (
    <CmsEditorPage
      listPath={ROUTES.evidence}
      listLabel="Evidence"
      pageLabel="New evidence"
    >
      <EvidenceEditorForm mode="create" heading="New evidence record" />
    </CmsEditorPage>
  );
}
