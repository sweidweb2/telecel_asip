import type { Metadata } from "next";

import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { StartupEditorForm } from "@/components/startups/startup-editor-form";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "New startup | ASIP Editor",
};

export default function NewStartupPage() {
  return (
    <CmsEditorPage
      listPath={ROUTES.portfolio}
      listLabel="Startup"
      pageLabel="New startup"
    >
      <StartupEditorForm mode="create" heading="New startup" />
    </CmsEditorPage>
  );
}
