import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
import { getStartupByIdForAdmin } from "@/data/startups";

export const metadata: Metadata = {
  title: "Edit startup | ASIP Admin",
};

type EditStartupPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditStartupPage({ params }: EditStartupPageProps) {
  const { id } = await params;
  const result = await getStartupByIdForAdmin(id);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);
  if (result.status === "not_found") notFound();

  const { startup } = result;

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.portfolio} />}>
              Portfolio
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{startup.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <StartupEditorForm
        mode="edit"
        startup={startup}
        heading="Edit startup"
        description="Update core fields, details, logo, or delete this portfolio company."
      />
    </main>
  );
}
