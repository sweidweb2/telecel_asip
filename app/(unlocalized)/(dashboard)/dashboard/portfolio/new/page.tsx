import type { Metadata } from "next";
import Link from "next/link";

import { StartupEditorForm } from "@/components/startups/startup-editor-form";
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
  title: "New startup | ASIP Admin",
};

export default async function NewStartupPage() {
  await requireEditor();

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.portfolio} />}>
              Startup
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New startup</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <StartupEditorForm
        mode="create"
        heading="New startup"
      />
    </main>
  );
}
