import type { Metadata } from "next";
import Link from "next/link";

import { EvidenceEditorForm } from "@/components/evidence-records/evidence-editor-form";
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
  title: "New evidence | ASIP Editor",
};

export default async function NewEvidencePage() {
  await requireEditor();

  return (
    <StaffMain>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.evidence} />}>
              Evidence
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New evidence</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <EvidenceEditorForm
        mode="create"
        heading="New evidence record"
      />
    </StaffMain>
  );
}
