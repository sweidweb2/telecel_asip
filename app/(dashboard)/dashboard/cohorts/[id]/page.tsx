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
    return { title: "Cohort | ASIP Admin" };
  }
  return { title: `${result.cohort.public_label} | ASIP Admin` };
}

export default async function EditCohortPage({ params }: EditCohortPageProps) {
  const { id } = await params;
  const result = await getCohortByIdForAdmin(id);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);
  if (result.status === "not_found") notFound();

  const pageLabel = result.cohort.public_label.trim() || "Edit cohort";

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
        description="Update programme details, publish status, and linked partners and founders."
      />
    </main>
  );
}
