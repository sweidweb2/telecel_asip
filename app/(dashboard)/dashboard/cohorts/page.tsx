import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { CohortStatsCards } from "@/components/dashboard/cms-list-stats";
import { CohortsTable } from "@/components/cohorts/cohorts-table";
import { Button } from "@/components/ui/button";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getCohortsPageData } from "@/data/cohorts";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseCohortListQuery } from "@/validations/cohort";

const resource = getAdminResource("cohorts");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type CohortsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CohortsPage({ searchParams }: CohortsPageProps) {
  const query = parseCohortListQuery(await searchParams);
  const { list, stats } = await loadAdminListPage({
    query,
    fetchPage: getCohortsPageData,
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
          render={<Link href={ROUTES.cohortsNew} />}
        >
          <PlusIcon className="size-4" />
          New cohort
        </Button>
      }
    >
      <CohortStatsCards stats={stats} />
      <CohortsTable
        cohorts={list.cohorts}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
