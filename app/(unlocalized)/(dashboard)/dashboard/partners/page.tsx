import type { Metadata } from "next";

import { CmsListPage } from "@/components/dashboard/cms-list-page";
import { PartnerStatsCards } from "@/components/dashboard/cms-list-stats";
import { PartnersTable } from "@/components/partners/partners-table";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getPartnersPageData } from "@/data/partners";
import { parsePartnerListQuery } from "@/validations/partner";

const resource = getAdminResource("partners");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type PartnersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default function PartnersPage({ searchParams }: PartnersPageProps) {
  return (
    <CmsListPage
      resourceId="partners"
      searchParams={searchParams}
      parseQuery={parsePartnerListQuery}
      fetchPage={getPartnersPageData}
      activeFilters={(query) => ({
        search: query.search || undefined,
        type: query.type !== "all" ? query.type : undefined,
        status: query.status !== "all" ? query.status : undefined,
      })}
      newItem={{ href: ROUTES.partnersNew, label: "New partner" }}
      showPublicReflection
      stats={(result) => <PartnerStatsCards stats={result.stats} />}
    >
      {({ query, result }) => (
        <PartnersTable
          partners={result.list.partners}
          total={result.list.total}
          totalPages={result.list.totalPages}
          query={query}
        />
      )}
    </CmsListPage>
  );
}
