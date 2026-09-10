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
import { StaffMain } from "@/components/dashboard/skip-to-content";
import { ROUTES } from "@/constants/routes";
import { requireEditor } from "@/data/auth";

export const metadata: Metadata = {
  title: "New startup | ASIP Editor",
};

export default async function NewStartupPage() {
  await requireEditor();

  return (
    <StaffMain>
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
    </StaffMain>
  );
}
