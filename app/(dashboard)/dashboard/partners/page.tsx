import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { PartnerFormDialog } from "@/components/partners/partner-form-dialog";
import { PartnersTable } from "@/components/partners/partners-table";
import { getAdminResource } from "@/constants/admin-resources";
import { getPartnersPageData } from "@/data/partners";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parsePartnerListQuery } from "@/validations/partner";

const resource = getAdminResource("partners");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type PartnersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PartnersPage({
  searchParams,
}: PartnersPageProps) {
  const query = parsePartnerListQuery(await searchParams);
  const { list } = await loadAdminListPage({
    query,
    fetchPage: getPartnersPageData,
    listPath: resource.listPath,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, {
        search: q.search || undefined,
        type: q.type !== "all" ? q.type : undefined,
        status: q.status !== "all" ? q.status : undefined,
      }),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      description={resource.description}
      actions={<PartnerFormDialog mode="create" />}
    >
      <PartnersTable
        partners={list.partners}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
