"use client";

import { AdminFilterBar } from "@/components/dashboard/admin-filter-bar";
import { AdminInboxStatusFilter } from "@/components/dashboard/admin-inbox-status-filter";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { InterestRegistrationListQuery } from "@/validations/interest-registration";

export function RegistrationsFilters({
  query,
}: {
  query: InterestRegistrationListQuery;
}) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.registrations,
      search: query.search,
    });

  const hasFilters = query.search !== "" || query.inboxStatus !== "inbox";

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
    >
      <AdminInboxStatusFilter
        id="registrations-inbox-status"
        value={query.inboxStatus}
        disabled={isPending}
        onChange={(value) =>
          navigate({ inboxStatus: value === "inbox" ? "" : value })
        }
      />
    </AdminFilterBar>
  );
}
