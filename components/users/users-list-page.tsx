import { AdminListPageShell } from "@/components/dashboard/admin-list-page-shell";
import { InboxCsvDownloadLink } from "@/components/dashboard/inbox-csv-download-link";
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

type UsersListPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  actorRole: "admin" | "editor";
  listPath: string;
  /** Shown only on the editor Users list. */
  showEditorBlurb?: boolean;
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

/**
 * Shared Users list for Admin and Editor shells. Routes pass role, list path,
 * and optional editor-only blurb; metadata stays on the route files.
 */
export async function UsersListPage({
  searchParams,
  actorRole,
  listPath,
  showEditorBlurb = false,
}: UsersListPageProps) {
  const query = parseUserListQuery(await searchParams);
  const { list, stats } = await loadAdminListPage({
    query,
    fetchPage: getUsersPageData,
    listPath,
    buildClampParams: (q, totalPages) =>
      adminListClampParams(totalPages, usersClampFilters(q)),
  });

  return (
    <AdminListPageShell
      title={resource.pageTitle}
      actions={
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
          <CreateUserDialog actorRole={actorRole} />
          <InboxCsvDownloadLink href="/api/admin/export/profiles" />
        </div>
      }
    >
      {showEditorBlurb ? (
        <p className="text-sm text-muted-foreground">
          Editors can create editor and viewer accounts for CMS work. Admin
          accounts are managed in the Admin panel.
        </p>
      ) : null}

      <UserStatsCards stats={stats} actorRole={actorRole} />

      <UsersTable
        users={list.users}
        total={list.total}
        totalPages={list.totalPages}
        query={query}
        listPath={listPath}
        actorRole={actorRole}
      />
    </AdminListPageShell>
  );
}
