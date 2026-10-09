import type { Metadata } from "next";

import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { StartupEditorForm } from "@/components/startups/startup-editor-form";
import { ROUTES } from "@/constants/routes";
import { getStartupByIdForAdmin } from "@/data/startups";

export const metadata: Metadata = {
  title: "Edit startup | ASIP Editor",
};

type EditStartupPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditStartupPage({
  params,
}: EditStartupPageProps) {
  const { id } = await params;

  return (
    <CmsEditorPage
      listPath={ROUTES.portfolio}
      listLabel="Startups"
      load={() => getStartupByIdForAdmin(id)}
      pageLabel={(record) => record.startup.name}
    >
      {(record) => (
        <StartupEditorForm
          mode="edit"
          startup={record.startup}
          heading="Edit startup"
        />
      )}
    </CmsEditorPage>
  );
}
