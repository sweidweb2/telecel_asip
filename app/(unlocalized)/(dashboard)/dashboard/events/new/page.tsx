import type { Metadata } from "next";

import { EventEditorForm } from "@/components/events/event-editor-form";
import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "New event | ASIP Editor",
};

export default function NewEventPage() {
  return (
    <CmsEditorPage
      listPath={ROUTES.events}
      listLabel="Events"
      pageLabel="New event"
    >
      <EventEditorForm mode="create" heading="New event" />
    </CmsEditorPage>
  );
}
