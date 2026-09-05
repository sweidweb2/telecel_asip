import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { EvidenceDetailContent } from "@/components/evidence-records/evidence-detail-content";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ROUTES } from "@/constants/routes";
import { getCurrentUserProfile } from "@/data/users";
import {
  getEvidenceOwnerOptions,
  getEvidenceRecordByIdForAdmin,
} from "@/data/evidence-records";

type EvidenceDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EvidenceDetailPageProps): Promise<Metadata> {
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

export default async function EvidenceDetailPage({
  params,
}: EvidenceDetailPageProps) {
  const { id } = await params;

  const [result, ownersResult, profile] = await Promise.all([
    getEvidenceRecordByIdForAdmin(id),
    getEvidenceOwnerOptions(),
    getCurrentUserProfile(),
  ]);

  if (result.status === "forbidden" || ownersResult.status === "forbidden") {
    redirect(ROUTES.dashboard);
  }
  if (result.status === "not_found") notFound();

  const owners = ownersResult.owners;
  const defaultOwnerId = profile?.id ?? owners[0]?.id ?? "";
  const crumb =
    result.record.primary_source.length > 48
      ? `${result.record.primary_source.slice(0, 48)}…`
      : result.record.primary_source;

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
              {crumb}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <EvidenceDetailContent
        record={result.record}
        owners={owners}
        defaultOwnerId={defaultOwnerId}
      />
    </main>
  );
}
