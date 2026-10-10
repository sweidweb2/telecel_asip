import type { Metadata } from "next";

import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { EvidenceEditorForm } from "@/components/evidence-records/evidence-editor-form";
import { ROUTES } from "@/constants/routes";
import { getEvidenceRecordByIdForAdmin } from "@/data/evidence-records";

type EditEvidencePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditEvidencePageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getEvidenceRecordByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Evidence | ASIP Editor" };
  }
  const title =
    result.record.primary_source.length > 40
      ? `${result.record.primary_source.slice(0, 40)}…`
      : result.record.primary_source;
  return { title: `${title} | ASIP Editor` };
}

export default async function EditEvidencePage({
  params,
}: EditEvidencePageProps) {
  const { id } = await params;

  return (
    <CmsEditorPage
      listPath={ROUTES.evidence}
      listLabel="Evidence"
      load={() => getEvidenceRecordByIdForAdmin(id)}
      pageLabel={(record) =>
        record.record.primary_source.length > 48
          ? `${record.record.primary_source.slice(0, 48)}…`
          : record.record.primary_source.trim() || "Edit evidence"
      }
    >
      {(record) => (
        <EvidenceEditorForm
          mode="edit"
          record={record.record}
          owners={
            record.record.owner
              ? [
                  {
                    id: record.record.owner.id,
                    email: record.record.owner.email,
                    full_name: record.record.owner.full_name,
                  },
                ]
              : []
          }
          defaultOwnerId={record.record.owner_id}
          heading="Edit evidence record"
        />
      )}
    </CmsEditorPage>
  );
}
