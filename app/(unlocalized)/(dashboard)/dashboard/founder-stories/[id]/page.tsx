import type { Metadata } from "next";

import { CmsEditorPage } from "@/components/dashboard/cms-editor-page";
import { FounderStoryEditorForm } from "@/components/founder-stories/founder-story-editor-form";
import { ROUTES } from "@/constants/routes";
import { getFounderStoryByIdForAdmin } from "@/data/founder-stories";

type EditFounderStoryPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditFounderStoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getFounderStoryByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Founder story | ASIP Editor" };
  }
  return {
    title: `${result.story.startup_name || "Founder story"} | ASIP Editor`,
  };
}

export default async function EditFounderStoryPage({
  params,
}: EditFounderStoryPageProps) {
  const { id } = await params;

  return (
    <CmsEditorPage
      listPath={ROUTES.founderStories}
      listLabel="Founder stories"
      load={() => getFounderStoryByIdForAdmin(id)}
      pageLabel={(record) => record.story.startup_name.trim() || "Edit story"}
    >
      {(record) => (
        <FounderStoryEditorForm
          mode="edit"
          story={record.story}
          startups={[
            {
              id: record.story.startup_id,
              name: record.story.startup_name || "Linked startup",
            },
          ]}
          heading="Edit founder story"
        />
      )}
    </CmsEditorPage>
  );
}
