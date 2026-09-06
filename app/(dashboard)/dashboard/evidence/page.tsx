import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { EvidenceStatsCards } from "@/components/dashboard/cms-list-stats";
import { EvidenceRecordsTable } from "@/components/evidence-records/evidence-records-table";
import { Button } from "@/components/ui/button";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getEvidenceRecordsPageData } from "@/data/evidence-records";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseEvidenceListQuery } from "@/validations/evidence-record";

const resource = getAdminResource("evidence");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type EvidencePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EvidencePage({ searchParams }: EvidencePageProps) {
  const query = parseEvidenceListQuery(await searchParams);
  const { list, stats } = await loadAdminListPage({
    query,
    fetchPage: getEvidenceRecordsPageData,
    listPath: resource.listPath,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, {
        search: q.search || undefined,
        status: q.status !== "all" ? q.status : undefined,
        permission: q.permission !== "all" ? q.permission : undefined,
      }),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      actions={
        <Button
          className="min-h-11 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href={ROUTES.evidenceNew} />}
        >
          <PlusIcon className="size-4" />
          New evidence
        </Button>
      }
    >
      <EvidenceStatsCards stats={stats} />
      <EvidenceRecordsTable
        records={list.records}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
