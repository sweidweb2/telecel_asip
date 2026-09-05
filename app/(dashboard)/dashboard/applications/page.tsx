import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { ApplicationsTable } from "@/components/applications/applications-table";
import { getAdminResource } from "@/constants/admin-resources";
import { getApplicationsPageData } from "@/data/applications";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseApplicationListQuery } from "@/validations/application";

const resource = getAdminResource("applications");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type ApplicationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const query = parseApplicationListQuery(await searchParams);
  const { list } = await loadAdminListPage({
    query,
    fetchPage: getApplicationsPageData,
    listPath: resource.listPath,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, {
        search: q.search || undefined,
      }),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      description={resource.description}
    >
      <ApplicationsTable
        applications={list.applications}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
