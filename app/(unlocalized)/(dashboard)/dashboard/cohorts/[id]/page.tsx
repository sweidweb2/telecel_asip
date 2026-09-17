import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
import { getCohortByIdForAdmin } from "@/data/cohorts";

type EditCohortPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditCohortPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getCohortByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Cohort | ASIP Editor" };
  }
  return { title: `${result.cohort.public_label} | ASIP Editor` };
}

export default async function EditCohortPage({ params }: EditCohortPageProps) {
  const { id } = await params;
  const result = await getCohortByIdForAdmin(id);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);
  if (result.status === "not_found") notFound();

  const pageLabel = result.cohort.public_label.trim() || "Edit cohort";

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
            <BreadcrumbPage className="max-w-[16rem] truncate sm:max-w-md">
              {pageLabel}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CohortEditorForm
        mode="edit"
        cohort={result.cohort}
        heading="Edit cohort"
      />
    </StaffMain>
  );
}
