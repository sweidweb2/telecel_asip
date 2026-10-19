import type { Metadata } from "next";

import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { EvidenceStatsCards } from "@/components/dashboard/cms-list-stats";
import { EvidenceRecordsTable } from "@/components/evidence-records/evidence-records-table";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getEvidenceRecordsPageData } from "@/data/evidence-records";
import { parseEvidenceListQuery } from "@/validations/evidence-record";

const resource = getAdminResource("evidence");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type EvidencePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function EvidencePage({ searchParams }: EvidencePageProps) {
  return (
    <CmsListPage
      resourceId="evidence"
      searchParams={searchParams}
      parseQuery={parseEvidenceListQuery}
      fetchPage={getEvidenceRecordsPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        status: query.status !== "all" ? query.status : undefined,
        permission: query.permission !== "all" ? query.permission : undefined,
      })}
      newItem={{ href: ROUTES.evidenceNew, label: "New evidence" }}
      stats={(result) => <EvidenceStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <EvidenceRecordsTable
          records={result.list.records}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
