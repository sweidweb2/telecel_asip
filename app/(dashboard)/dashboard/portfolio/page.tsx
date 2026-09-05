import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { StartupsAdminList } from "@/components/startups/startups-admin-list";
import { getAdminResource } from "@/constants/admin-resources";
import { getStartupsPageData } from "@/data/startups";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseStartupListQuery } from "@/validations/startup";

const resource = getAdminResource("portfolio");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type PortfolioPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortfolioAdminPage({
  searchParams,
}: PortfolioPageProps) {
  const query = parseStartupListQuery(await searchParams);
  const { list } = await loadAdminListPage({
    query,
    fetchPage: getStartupsPageData,
    listPath: resource.listPath,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, {
        search: q.search || undefined,
        status: q.status !== "all" ? q.status : undefined,
      }),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      description={resource.description}
    >
      <StartupsAdminList
        startups={list.startups}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
