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

export function UsersFilters({ query }: { query: UserListQuery }) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.users,
      search: query.search,
    });

  const hasFilters = query.search !== "" || query.role !== "all";

  return (
    <AdminFilterBar
      searchId="users-search"
      searchLabel="Search users"
      searchPlaceholder="Filter by name or email…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.users}
      onClear={clearSearchLocal}
    >
      <Label htmlFor="users-role" className="sr-only">
        Role
      </Label>
      <Select
        value={query.role}
        onValueChange={(value) => {
          if (value) navigate({ role: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="users-role"
          className="min-h-11 w-full sm:min-h-8 sm:w-36"
        >
          <AdminFilterSelectValue
            label="Role"
            optionLabels={ROLE_OPTION_LABELS}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All roles</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
    </AdminFilterBar>
  );
}
