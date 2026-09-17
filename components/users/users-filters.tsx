"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { AdminFilterBar } from "@/components/dashboard/admin-filter-bar";
import { AdminFilterSelectValue } from "@/components/dashboard/admin-filter-select-value";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { UserListQuery } from "@/validations/users";

const ROLE_OPTION_LABELS = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
} as const;

export function UsersFilters({
  query,
  listPath = ROUTES.users,
  actorRole = "admin",
}: {
  query: UserListQuery;
  listPath?: string;
  actorRole?: "admin" | "editor";
}) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: listPath,
      search: query.search,
    });

  const canFilterAdmins = actorRole === "admin";
  const roleValue =
    !canFilterAdmins && query.role === "admin" ? "all" : query.role;
  const hasFilters = query.search !== "" || roleValue !== "all";
  const optionLabels = canFilterAdmins
    ? ROLE_OPTION_LABELS
    : {
        editor: ROLE_OPTION_LABELS.editor,
        viewer: ROLE_OPTION_LABELS.viewer,
      };

  return (
    <AdminFilterBar
      searchId="users-search"
      searchLabel="Search users"
      searchPlaceholder="Filter by name or email…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={listPath}
      onClear={clearSearchLocal}
    >
      <Label htmlFor="users-role" className="sr-only">
        Role
      </Label>
      <Select
        value={roleValue}
        onValueChange={(value) => {
          if (value) navigate({ role: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="users-role"
          className="min-h-11 w-full sm:min-h-8 sm:w-36"
        >
          <AdminFilterSelectValue label="Role" optionLabels={optionLabels} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          {canFilterAdmins ? (
            <SelectItem value="admin">Admin</SelectItem>
          ) : null}
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
    </AdminFilterBar>
  );
}
