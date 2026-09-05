"use client";

import { AdminFilterBar } from "@/components/dashboard/admin-filter-bar";
import { AdminInboxStatusFilter } from "@/components/dashboard/admin-inbox-status-filter";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { ApplicationListQuery } from "@/validations/application";

export function ApplicationsFilters({
  query,
}: {
  query: ApplicationListQuery;
}) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.applications,
      search: query.search,
    });

  const hasFilters = query.search !== "" || query.inboxStatus !== "inbox";

  return (
    <AdminFilterBar
      searchId="applications-search"
      searchLabel="Search applications"
      searchPlaceholder="Filter by name, email, or startup…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.applications}
      onClear={clearSearchLocal}
    >
      <AdminInboxStatusFilter
        id="applications-inbox-status"
        value={query.inboxStatus}
        disabled={isPending}
        onChange={(value) =>
          navigate({ inboxStatus: value === "inbox" ? "" : value })
        }
      />
    </AdminFilterBar>
  );
}
