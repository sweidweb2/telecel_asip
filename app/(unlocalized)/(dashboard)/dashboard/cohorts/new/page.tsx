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
import { ROUTES } from "@/constants/routes";
import { requireAdmin } from "@/data/auth";

export const metadata: Metadata = {
  title: "New cohort | ASIP Admin",
};

export default async function NewCohortPage() {
  await requireAdmin();

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
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
    </main>
  );
}
