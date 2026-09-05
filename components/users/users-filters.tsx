"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminFilterBar } from "@/components/dashboard/admin-filter-bar";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { UserListQuery } from "@/validations/users";

type UsersFiltersProps = {
  query: UserListQuery;
  /** Instant client-side filter (does not hit the server). */
  onSearchChange?: (value: string) => void;
};

export function UsersFilters({ query, onSearchChange }: UsersFiltersProps) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.users,
      search: query.search,
    });

  const hasFilters = query.search !== "" || query.role !== "all";

  function onSearchInput(value: string) {
    onSearchChange?.(value);
    handleSearchChange(value);
  }

  function onClear() {
    clearSearchLocal();
    onSearchChange?.("");
  }

  return (
    <AdminFilterBar
      searchId="users-search"
      searchLabel="Search users"
      searchPlaceholder="Filter by name or email…"
      search={search}
      isPending={isPending}
      onSearchChange={onSearchInput}
      hasFilters={hasFilters}
      clearHref={ROUTES.users}
      onClear={onClear}
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
          <SelectValue placeholder="All roles" />
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
