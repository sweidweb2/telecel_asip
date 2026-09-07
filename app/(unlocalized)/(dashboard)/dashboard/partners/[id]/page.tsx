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
    return { title: "Partner | ASIP Admin" };
  }
  return { title: `${result.partner.name} | ASIP Admin` };
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
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
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
    </main>
  );
}
