import type { Metadata } from "next";

import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { FounderStoryEditorForm } from "@/components/founder-stories/founder-story-editor-form";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  title: "New founder story | ASIP Editor",
};

export default function NewFounderStoryPage() {
  return (
    <CmsEditorPage
      listPath={ROUTES.founderStories}
      listLabel="Founder stories"
      pageLabel="New story"
    >
      <FounderStoryEditorForm mode="create" heading="New founder story" />
    </CmsEditorPage>
  );
}
