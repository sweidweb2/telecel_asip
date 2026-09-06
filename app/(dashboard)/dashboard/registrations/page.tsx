import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { InboxStatsCards } from "@/components/dashboard/inbox-stats-cards";
import { RegistrationsTable } from "@/components/registrations/registrations-table";
import { getAdminResource } from "@/constants/admin-resources";
import { getInterestRegistrationsPageData } from "@/data/interest-registrations";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseInterestRegistrationListQuery } from "@/validations/interest-registration";

const resource = getAdminResource("registrations");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type RegistrationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RegistrationsPage({
  searchParams,
}: RegistrationsPageProps) {
  const query = parseInterestRegistrationListQuery(await searchParams);
  const { list, stats } = await loadAdminListPage({
    query,
    fetchPage: getInterestRegistrationsPageData,
    listPath: resource.listPath,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, {
        search: q.search || undefined,
        inboxStatus: q.inboxStatus !== "inbox" ? q.inboxStatus : undefined,
      }),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
    >
      <InboxStatsCards stats={stats} />
      <RegistrationsTable
        registrations={list.registrations}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
