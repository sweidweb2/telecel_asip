"use client";

import { AdminFilterBar } from "@/components/dashboard/admin-filter-bar";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { ApplicationListQuery } from "@/validations/application";

export function ApplicationsFilters({
  query,
  onSearchChange,
}: {
  query: ApplicationListQuery;
  onSearchChange?: (value: string) => void;
}) {
  const { search, isPending, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.applications,
      search: query.search,
    });

  const hasFilters = query.search !== "";

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
      searchId="applications-search"
      searchLabel="Search applications"
      searchPlaceholder="Filter by name, email, or startup…"
      search={search}
      isPending={isPending}
      onSearchChange={onSearchInput}
      hasFilters={hasFilters}
      clearHref={ROUTES.applications}
      onClear={onClear}
    />
  );
}
