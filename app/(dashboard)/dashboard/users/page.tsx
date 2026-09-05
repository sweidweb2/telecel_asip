import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { CreateUserDialog } from "@/components/users/user-dialogs";
import { UserStatsCards } from "@/components/users/user-stats";
import { UsersTable } from "@/components/users/users-table";
import { getAdminResource } from "@/constants/admin-resources";
import { getUsersPageData } from "@/data/users";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseUserListQuery } from "@/validations/users";

const resource = getAdminResource("users");

export const metadata: Metadata = {
  title: resource.metaTitle,
};

type UsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const query = parseUserListQuery(await searchParams);
  const { list, stats } = await loadAdminListPage({
    query,
    fetchPage: getUsersPageData,
    listPath: resource.listPath,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, {
        search: q.search || undefined,
        role: q.role !== "all" ? q.role : undefined,
      }),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      description={resource.description}
      actions={<CreateUserDialog />}
    >
      <UserStatsCards stats={stats} />

      <UsersTable
        users={list.users}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
      />
    </AdminListPageShell>
  );
}
