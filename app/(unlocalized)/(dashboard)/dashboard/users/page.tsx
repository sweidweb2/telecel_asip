import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { CreateUserDialog } from "@/components/users/user-dialogs";
import { UserStatsCards } from "@/components/users/user-stats";
import { UsersTable } from "@/components/users/users-table";
import { getAdminResource } from "@/constants/admin-resources";
import { ROUTES } from "@/constants/routes";
import { getUsersPageData } from "@/data/users";
import {
  adminListClampParams,
  loadAdminListPage,
} from "@/lib/admin/load-admin-list-page";
import { parseUserListQuery } from "@/validations/users";

const resource = getAdminResource("users");

export const metadata: Metadata = {
  title: "Users | ASIP Editor",
};

type UsersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditorUsersPage({ searchParams }: UsersPageProps) {
  const query = parseUserListQuery(await searchParams);
  const { list, stats } = await loadAdminListPage({
    query,
    fetchPage: getUsersPageData,
    listPath: ROUTES.users,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, {
        search: q.search || undefined,
        role: q.role !== "all" ? q.role : undefined,
      }),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      actions={<CreateUserDialog actorRole="editor" />}
    >
      <UserStatsCards stats={stats} actorRole="editor" />

      <UsersTable
        users={list.users}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
        listPath={ROUTES.users}
        actorRole="editor"
      />
    </AdminListPageShell>
  );
}
