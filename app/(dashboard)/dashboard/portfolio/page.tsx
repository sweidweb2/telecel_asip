import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { StartupStatsCards } from "@/components/dashboard/cms-list-stats";
import { StartupsTable } from "@/components/startups/startups-table";
import { Button } from "@/components/ui/button";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
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
  const { list, stats } = await loadAdminListPage({
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
      actions={
        <Button
          className="min-h-11 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href={ROUTES.portfolioNew} />}
        >
          <PlusIcon className="size-4" />
          New startup
        </Button>
      }
    >
      <StartupStatsCards stats={stats} />
      <StartupsTable
        startups={list.startups}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
