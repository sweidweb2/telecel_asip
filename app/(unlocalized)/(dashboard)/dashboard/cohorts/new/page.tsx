import type { Metadata } from "next";
import Link from "next/link";

import { CohortEditorForm } from "@/components/cohorts/cohort-editor-form";
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
  title: "New cohort | ASIP Editor",
};

export default async function NewCohortPage() {
  await requireEditor();

  return (
    <StaffMain>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.cohorts} />}>
              Cohorts
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New cohort</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CohortEditorForm
        mode="create"
        heading="New cohort"
      />
    </StaffMain>
  );
}
