"use client";

import { AdminFilterBar } from "@/components/dashboard/admin-filter-bar";
import { AdminInboxStatusFilter } from "@/components/dashboard/admin-inbox-status-filter";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { InvestorInterestListQuery } from "@/validations/investor-interest";

export function InvestorInterestsFilters({
  query,
}: {
  query: InvestorInterestListQuery;
}) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.investorInterests,
      search: query.search,
    });

  const hasFilters = query.search !== "" || query.inboxStatus !== "inbox";

  return (
    <AdminFilterBar
      searchId="investor-interests-search"
      searchLabel="Search investor interests"
      searchPlaceholder="Filter by name, email, or organization…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.investorInterests}
      onClear={clearSearchLocal}
    >
      <AdminInboxStatusFilter
        id="investor-interests-inbox-status"
        value={query.inboxStatus}
        disabled={isPending}
        onChange={(value) =>
          navigate({ inboxStatus: value === "inbox" ? "" : value })
        }
      />
    </AdminFilterBar>
  );
}
