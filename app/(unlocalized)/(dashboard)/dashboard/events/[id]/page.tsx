import type { Metadata } from "next";

import { EventEditorForm } from "@/components/events/event-editor-form";
import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { ROUTES } from "@/constants/routes";
import { getEventByIdForAdmin } from "@/data/events";

type EditEventPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditEventPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getEventByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Event | ASIP Editor" };
  }
  return { title: `${result.event.name} | ASIP Editor` };
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;

  return (
    <CmsEditorPage
      listPath={ROUTES.events}
      listLabel="Events"
      load={() => getEventByIdForAdmin(id)}
      pageLabel={(record) => record.event.name.trim() || "Edit event"}
    >
      {(record) => (
        <EventEditorForm
          mode="edit"
          event={record.event}
          heading="Edit event"
        />
      )}
    </CmsEditorPage>
  );
}
