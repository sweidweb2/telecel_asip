"use client";

import { useCallback, useState } from "react";
import { UserRoundSearchIcon } from "lucide-react";

import { AdminClickableRow } from "@/components/dashboard/admin-clickable-row";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { AdminSortableHead } from "@/components/dashboard/admin-sortable-head";
import {
  UserDeleteDialog,
  UserEditDialog,
  UserRowActions,
  UserViewDialog,
} from "@/components/users/user-row-dialogs";
import { UsersFilters } from "@/components/users/users-filters";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { Profile } from "@/types/profile";
import { USER_PAGE_SIZE, type UserListQuery } from "@/validations/users";

const ROLE_VARIANT = {
  admin: "default",
  editor: "secondary",
  viewer: "outline",
} as const;

const ROLE_LABELS = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
} as const;

function usersListFilters(query: UserListQuery) {
  const isDefaultSort =
    query.sort === "created_at" && query.dir === "desc";
  return {
    search: query.search || undefined,
    role: query.role === "all" ? undefined : query.role,
    sort: isDefaultSort ? undefined : query.sort,
    dir: isDefaultSort ? undefined : query.dir,
  };
}

export function UsersTable({
  users,
  total,
  totalPages,
  query,
  listPath = ROUTES.users,
  actorRole,
}: {
  users: Profile[];
  total: number;
  totalPages: number;
  query: UserListQuery;
  listPath?: string;
  actorRole: "admin" | "editor";
}) {
  const [dialog, setDialog] = useState<
    { type: "view" | "edit" | "delete"; user: Profile } | null
  >(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const onView = useCallback((user: Profile) => {
    setDialog({ type: "view", user });
  }, []);
  const onEdit = useCallback((user: Profile) => {
    setDialog({ type: "edit", user });
  }, []);
  const onDelete = useCallback((user: Profile) => {
    setDialog({ type: "delete", user });
  }, []);
  const listFilters = usersListFilters(query);
  const sortFilters = {
    search: listFilters.search,
    role: listFilters.role,
  };
  const isFiltered = adminListFiltersActive({
    search: listFilters.search,
    role: listFilters.role,
  });

  return (
    <>
    <AdminDataTable
      filters={
        <UsersFilters
          query={query}
          listPath={listPath}
          actorRole={actorRole}
        />
      }
      header={
        <TableRow>
          <AdminRowNumberHead />
          <AdminSortableHead
            label="Full name"
            sortKey="full_name"
            currentSort={query.sort}
            currentDir={query.dir}
            basePath={listPath}
            filters={sortFilters}
          />
          <AdminSortableHead
            label="Email"
            sortKey="email"
            currentSort={query.sort}
            currentDir={query.dir}
            basePath={listPath}
            filters={sortFilters}
          />
          <AdminSortableHead
            label="Role"
            sortKey="role"
            currentSort={query.sort}
            currentDir={query.dir}
            basePath={listPath}
            filters={sortFilters}
          />
          <AdminSortableHead
            label="Created"
            sortKey="created_at"
            currentSort={query.sort}
            currentDir={query.dir}
            basePath={listPath}
            filters={sortFilters}
          />
          <AdminSortableHead
            label="Updated"
            sortKey="updated_at"
            currentSort={query.sort}
            currentDir={query.dir}
            basePath={listPath}
            filters={sortFilters}
          />
          <TableHead className="w-28 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={users.length === 0}
      emptyColSpan={7}
      empty={
        <AdminEmptyState
          icon={UserRoundSearchIcon}
          isFiltered={isFiltered}
          emptyTitle="No users yet"
          emptyDescription="Create a user from the header."
          noResultsTitle="No users found"
          noResultsDescription="Try changing the filters or clearing search."
        />
      }
      pagination={{
        basePath: listPath,
        page: query.page,
        pageSize: USER_PAGE_SIZE,
        total,
        totalPages,
        filters: listFilters,
      }}
    >
      {users.map((user, index) => (
        <AdminClickableRow
          key={user.id}
          ariaLabel={`Edit user ${user.full_name || user.email}`}
          onActivate={() => onEdit(user)}
        >
          <AdminRowNumberCell
            page={query.page}
            pageSize={USER_PAGE_SIZE}
            index={index}
          />
          <TableCell className="max-w-[10rem] truncate font-medium sm:max-w-[14rem]">
            {user.full_name || "-"}
          </TableCell>
          <TableCell className="max-w-[11rem] truncate sm:max-w-[16rem]">
            {user.email}
          </TableCell>
          <TableCell>
            <Badge variant={ROLE_VARIANT[user.role]}>
              {ROLE_LABELS[user.role]}
            </Badge>
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">
            {formatAdminDate(user.created_at)}
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">
            {formatAdminDate(user.updated_at)}
          </TableCell>
          <TableCell
            className="pr-4"
            onClick={(event) => event.stopPropagation()}
          >
            <UserRowActions
              user={user}
              actorRole={actorRole}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </TableCell>
        </AdminClickableRow>
      ))}
    </AdminDataTable>

      <UserViewDialog
        open={dialog?.type === "view"}
        user={dialog?.type === "view" ? dialog.user : null}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <UserEditDialog
        open={dialog?.type === "edit"}
        user={dialog?.type === "edit" ? dialog.user : null}
        actorRole={actorRole}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <UserDeleteDialog
        open={dialog?.type === "delete"}
        user={dialog?.type === "delete" ? dialog.user : null}
        actorRole={actorRole}
        onOpenChange={(open) => !open && closeDialog()}
      />
    </>
  );
}
