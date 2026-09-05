import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { EvidenceFormDialog } from "@/components/evidence-records/evidence-form-dialog";
import { EvidenceRecordsTable } from "@/components/evidence-records/evidence-records-table";
import { ROUTES } from "@/constants/routes";
import { getCurrentUserProfile } from "@/data/users";
import {
  getEvidenceOwnerOptions,
  getEvidenceRecordsPageData,
} from "@/data/evidence-records";
import { parseEvidenceListQuery } from "@/validations/evidence-record";

export const metadata: Metadata = {
  title: "Evidence | ASIP Admin",
};

type EvidencePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EvidencePage({ searchParams }: EvidencePageProps) {
  const query = parseEvidenceListQuery(await searchParams);

  const [result, ownersResult, profile] = await Promise.all([
    getEvidenceRecordsPageData(query),
    getEvidenceOwnerOptions(),
    getCurrentUserProfile(),
  ]);

  if (result.status === "forbidden" || ownersResult.status === "forbidden") {
    redirect(ROUTES.dashboard);
  }

  const { list } = result;
  const owners = ownersResult.owners;
  const defaultOwnerId = profile?.id ?? owners[0]?.id ?? "";

  if (query.page > list.totalPages) {
    const params = new URLSearchParams({ page: String(list.totalPages) });
    if (query.search) params.set("search", query.search);
    if (query.status !== "all") params.set("status", query.status);
    if (query.permission !== "all") params.set("permission", query.permission);
    redirect(`${ROUTES.evidence}?${params.toString()}`);
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            Evidence
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Internal evidence register for claims and impact metrics.
          </p>
        </div>
        <EvidenceFormDialog
          mode="create"
          owners={owners}
          defaultOwnerId={defaultOwnerId}
        />
      </div>

      <EvidenceRecordsTable
        records={list.records}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
        owners={owners}
        defaultOwnerId={defaultOwnerId}
      />
    </main>
  );
}
