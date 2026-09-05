import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { FounderStoryEditorForm } from "@/components/founder-stories/founder-story-editor-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTES } from "@/constants/routes";
import {
  getFounderStoryByIdForAdmin,
  getStartupsForStoryPicker,
} from "@/data/founder-stories";

type EditFounderStoryPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditFounderStoryPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getFounderStoryByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Founder story | ASIP Admin" };
  }
  return {
    title: `${result.story.startup_name || "Founder story"} | ASIP Admin`,
  };
}

export default async function EditFounderStoryPage({
  params,
}: EditFounderStoryPageProps) {
  const { id } = await params;
  const result = await getFounderStoryByIdForAdmin(id);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);
  if (result.status === "not_found") notFound();

  const startupsResult = await getStartupsForStoryPicker({
    includeStartupId: result.story.startup_id,
  });
  if (startupsResult.status === "forbidden") redirect(ROUTES.dashboard);

  const pageLabel = result.story.startup_name.trim() || "Edit story";

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.founderStories} />}>
              Founder stories
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-[16rem] truncate sm:max-w-md">
              {pageLabel}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <FounderStoryEditorForm
        mode="edit"
        story={result.story}
        startups={startupsResult.startups}
        heading="Edit founder story"
        description="Update narrative modules, quote permission, and publish status."
      />
    </main>
  );
}
