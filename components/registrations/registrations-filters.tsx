"use client";

import { AdminFilterBar } from "@/components/dashboard/admin-filter-bar";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { InterestRegistrationListQuery } from "@/validations/interest-registration";

type RegistrationsFiltersProps = {
  query: InterestRegistrationListQuery;
  onSearchChange?: (value: string) => void;
};

export function RegistrationsFilters({
  query,
  onSearchChange,
}: RegistrationsFiltersProps) {
  const { search, isPending, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.registrations,
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
      searchId="registrations-search"
      searchLabel="Search registrations"
      searchPlaceholder="Filter by name, email, or company…"
      search={search}
      isPending={isPending}
      onSearchChange={onSearchInput}
      hasFilters={hasFilters}
      clearHref={ROUTES.registrations}
      onClear={onClear}
    />
  );
}
