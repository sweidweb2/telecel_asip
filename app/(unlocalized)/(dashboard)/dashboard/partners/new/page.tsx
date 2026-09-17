import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PartnerEditorForm } from "@/components/partners/partner-editor-form";
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
import { getPartnerSortOrderOccupants } from "@/data/partners";

export const metadata: Metadata = {
  title: "New partner | ASIP Editor",
};

export default async function NewPartnerPage() {
  await requireEditor();
  const orderResult = await getPartnerSortOrderOccupants();
  if (orderResult.status === "forbidden") redirect(ROUTES.dashboard);

  return (
    <StaffMain>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href={ROUTES.partners} />}>
              Partners
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New partner</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PartnerEditorForm
        mode="create"
        heading="New partner"
        orderSlots={orderResult.partners}
      />
    </StaffMain>
  );
}
