import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

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
import {
  getPartnerByIdForAdmin,
  getPartnerSortOrderOccupants,
} from "@/data/partners";

type EditPartnerPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditPartnerPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getPartnerByIdForAdmin(id);
  if (result.status !== "ok") {
    return { title: "Partner | ASIP Editor" };
  }
  return { title: `${result.partner.name} | ASIP Editor` };
}

export default async function EditPartnerPage({
  params,
}: EditPartnerPageProps) {
  const { id } = await params;
  const [result, orderResult] = await Promise.all([
    getPartnerByIdForAdmin(id),
    getPartnerSortOrderOccupants(),
  ]);

  if (result.status === "forbidden" || orderResult.status === "forbidden") {
    redirect(ROUTES.dashboard);
  }
  if (result.status === "not_found") notFound();

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
            <BreadcrumbPage className="max-w-[16rem] truncate sm:max-w-md">
              {result.partner.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PartnerEditorForm
        mode="edit"
        partner={result.partner}
        heading="Edit partner"
        orderSlots={orderResult.partners}
      />
    </StaffMain>
  );
}
