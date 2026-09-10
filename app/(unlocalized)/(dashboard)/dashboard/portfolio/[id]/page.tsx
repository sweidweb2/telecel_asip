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
import { StaffMain } from "@/components/dashboard/skip-to-content";
import { ROUTES } from "@/constants/routes";
import { getStartupByIdForAdmin } from "@/data/startups";

export const metadata: Metadata = {
  title: "Edit startup | ASIP Editor",
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
            <BreadcrumbPage>{startup.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <StartupEditorForm
        mode="edit"
        startup={startup}
        heading="Edit startup"
      />
    </StaffMain>
  );
}
