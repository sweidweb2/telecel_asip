"use client";

import { AdminFilterBar } from "@/components/dashboard/admin-filter-bar";
import { AdminInboxStatusFilter } from "@/components/dashboard/admin-inbox-status-filter";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { InvestorEngagementListQuery } from "@/validations/investor-engagement";

export function InvestorEngagementsFilters({
  query,
}: {
  query: InvestorEngagementListQuery;
}) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.investorEngagements,
      search: query.search,
    });

  const hasFilters = query.search !== "" || query.inboxStatus !== "inbox";

  return (
    <AdminFilterBar
      searchId="investor-engagements-search"
      searchLabel="Search investor engagements"
      searchPlaceholder="Filter by name, email, or organization…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.investorEngagements}
      onClear={clearSearchLocal}
    >
      <AdminInboxStatusFilter
        id="investor-engagements-inbox-status"
        value={query.inboxStatus}
        disabled={isPending}
        onChange={(value) =>
          navigate({ inboxStatus: value === "inbox" ? "" : value })
        }
      />
    </AdminFilterBar>
  );
}
