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
import {
  CMS_PUBLISH_STATUSES,
  CMS_PUBLISH_STATUS_LABELS,
} from "@/constants/cms-publish";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { CohortListQuery } from "@/validations/cohort";

export function CohortsFilters({ query }: { query: CohortListQuery }) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.cohorts,
      search: query.search,
    });

  const hasFilters = query.search !== "" || query.status !== "all";

  return (
    <AdminFilterBar
      searchId="cohorts-search"
      searchLabel="Search cohorts"
      searchPlaceholder="Search public label"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.cohorts}
      onClear={clearSearchLocal}
    >
      <Label htmlFor="cohorts-status" className="sr-only">
        Status
      </Label>
      <Select
        value={query.status}
        onValueChange={(value) => {
          if (value) navigate({ status: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="cohorts-status"
          className="min-h-11 w-full sm:min-h-8 sm:w-36"
        >
          <AdminFilterSelectValue
            label="Status"
            optionLabels={CMS_PUBLISH_STATUS_LABELS}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {CMS_PUBLISH_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {CMS_PUBLISH_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </AdminFilterBar>
  );
}
