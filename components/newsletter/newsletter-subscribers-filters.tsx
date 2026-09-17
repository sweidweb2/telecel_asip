"use client";

import { AdminFilterBar } from "@/components/dashboard/admin-filter-bar";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { NewsletterListQuery } from "@/validations/newsletter";

export function NewsletterSubscribersFilters({
  query,
}: {
  query: NewsletterListQuery;
}) {
  const { search, isPending, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.newsletter,
      search: query.search,
    });

  const hasFilters = query.search !== "";

  return (
    <AdminFilterBar
      searchId="newsletter-subscribers-search"
      searchLabel="Search newsletter subscribers"
      searchPlaceholder="Filter by email or source page…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.newsletter}
      onClear={clearSearchLocal}
    />
  );
}
