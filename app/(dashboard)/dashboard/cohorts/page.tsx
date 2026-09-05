import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { CohortsAdminList } from "@/components/cohorts/cohorts-admin-list";
import { getAdminResource } from "@/constants/admin-resources";
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
  const { list } = await loadAdminListPage({
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
      description={resource.description}
    >
      <CohortsAdminList
        cohorts={list.cohorts}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
