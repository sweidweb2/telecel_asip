import type { Metadata } from "next";
import Link from "next/link";

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
import { requireEditor } from "@/data/auth";

export const metadata: Metadata = {
  title: "New founder story | ASIP Admin",
};

export default async function NewFounderStoryPage() {
  await requireEditor();

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
            <BreadcrumbPage>New story</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <FounderStoryEditorForm
        mode="create"
        heading="New founder story"
      />
    </main>
  );
}
