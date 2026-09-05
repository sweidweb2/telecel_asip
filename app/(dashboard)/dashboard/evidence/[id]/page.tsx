import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EvidenceEditorForm } from "@/components/evidence-records/evidence-editor-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTES } from "@/constants/routes";
import { getEvidenceRecordByIdForAdmin } from "@/data/evidence-records";

type EditEvidencePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditEvidencePageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getEvidenceRecordByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Evidence | ASIP Admin" };
  }
  const title =
    result.record.primary_source.length > 40
      ? `${result.record.primary_source.slice(0, 40)}…`
      : result.record.primary_source;
  return { title: `${title} | ASIP Admin` };
}

export default async function EditEvidencePage({
  params,
}: EditEvidencePageProps) {
  const { id } = await params;
  const result = await getEvidenceRecordByIdForAdmin(id);

  if (result.status === "forbidden") redirect(ROUTES.dashboard);
  if (result.status === "not_found") notFound();

  const seedOwners = result.record.owner
    ? [
        {
          id: result.record.owner.id,
          email: result.record.owner.email,
          full_name: result.record.owner.full_name,
        },
      ]
    : [];
  const pageLabel =
    result.record.primary_source.length > 48
      ? `${result.record.primary_source.slice(0, 48)}…`
      : result.record.primary_source.trim() || "Edit evidence";

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.evidence} />}>
              Evidence
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
      <EvidenceEditorForm
        mode="edit"
        record={result.record}
        owners={seedOwners}
        defaultOwnerId={result.record.owner_id}
        heading="Edit evidence record"
        description="Update source details, verification status, and ownership. Only verified status may back live numbers later."
      />
    </main>
  );
}
