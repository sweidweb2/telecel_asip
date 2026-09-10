import type { Metadata } from "next";

import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { InboxCsvDownloadLink } from "@/components/dashboard/inbox-csv-download-link";
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

function usersClampFilters(query: ReturnType<typeof parseUserListQuery>) {
  const isDefaultSort =
    query.sort === "created_at" && query.dir === "desc";
  return {
    search: query.search || undefined,
    role: query.role !== "all" ? query.role : undefined,
    sort: isDefaultSort ? undefined : query.sort,
    dir: isDefaultSort ? undefined : query.dir,
  };
}

export default async function EditorUsersPage({ searchParams }: UsersPageProps) {
  const query = parseUserListQuery(await searchParams);
  const { list, stats } = await loadAdminListPage({
    query,
    fetchPage: getUsersPageData,
    listPath: ROUTES.users,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, usersClampFilters(q)),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      actions={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <CreateUserDialog actorRole="editor" />
          <InboxCsvDownloadLink href="/api/admin/export/profiles" />
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        Editors can create editor and viewer accounts for CMS work. Admin
        accounts are managed in the Admin panel.
      </p>

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
