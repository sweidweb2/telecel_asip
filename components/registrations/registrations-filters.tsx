"use client";

import { AdminFilterBar } from "@/components/dashboard/admin-filter-bar";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { InterestRegistrationListQuery } from "@/validations/interest-registration";

export function RegistrationsFilters({
  query,
}: {
  query: InterestRegistrationListQuery;
}) {
  const { search, isPending, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.registrations,
      search: query.search,
    });

  const hasFilters = query.search !== "";

  return (
    <AdminFilterBar
      searchId="registrations-search"
      searchLabel="Search registrations"
      searchPlaceholder="Filter by name, email, or company…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.registrations}
      onClear={clearSearchLocal}
    />
  );
}
