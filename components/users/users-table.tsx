"use client";

import { useState } from "react";
import { UserRoundSearchIcon } from "lucide-react";

import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import { UserRowActions } from "@/components/users/user-dialogs";
import { UsersFilters } from "@/components/users/users-filters";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import type { Profile } from "@/types/profile";
import { USER_PAGE_SIZE, type UserListQuery } from "@/validations/users";

const ROLE_VARIANT = {
  admin: "default",
  editor: "secondary",
  viewer: "outline",
} as const;

export function UsersTable({
  users,
  total,
  totalPages,
  query,
}: {
  users: Profile[];
  total: number;
  totalPages: number;
  query: UserListQuery;
}) {
  const [editUserId, setEditUserId] = useState<string | null>(null);

  return (
    <AdminDataTable
      filters={<UsersFilters query={query} />}
      header={
        <TableRow>
          <TableHead className="pl-4">Full name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-28 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={users.length === 0}
      emptyColSpan={6}
      empty={
        <AdminEmptyState
          icon={UserRoundSearchIcon}
          title="No users found"
          description="Try changing the search or role filter, or create a new user from the header."
        />
      }
      pagination={{
        basePath: ROUTES.users,
        page: query.page,
        pageSize: USER_PAGE_SIZE,
        total,
        totalPages,
        filters: {
          search: query.search,
          role: query.role === "all" ? undefined : query.role,
        },
      }}
    >
      {users.map((user) => (
        <TableRow
          key={user.id}
          className="cursor-pointer"
          onClick={() => setEditUserId(user.id)}
        >
          <TableCell className="max-w-[10rem] truncate pl-4 font-medium sm:max-w-[14rem]">
            {user.full_name || "—"}
          </TableCell>
          <TableCell className="max-w-[11rem] truncate sm:max-w-[16rem]">
            {user.email}
          </TableCell>
          <TableCell>
            <Badge variant={ROLE_VARIANT[user.role]}>{user.role}</Badge>
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
              editOpen={editUserId === user.id}
              onEditOpenChange={(open) =>
                setEditUserId(open ? user.id : null)
              }
            />
          </TableCell>
        </TableRow>
      ))}
    </AdminDataTable>
  );
}
