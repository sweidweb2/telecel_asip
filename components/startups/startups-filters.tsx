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
import type { StartupListQuery } from "@/validations/startup";

const STATUS_LABELS = {
  all: "All statuses",
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
} as const;

export function StartupsFilters({ query }: { query: StartupListQuery }) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.portfolio,
      search: query.search,
    });

  const hasFilters = query.search !== "" || query.status !== "all";

  return (
    <AdminFilterBar
      searchId="startups-search"
      searchLabel="Search startups"
      searchPlaceholder="Search name or slug"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.portfolio}
      onClear={clearSearchLocal}
    >
      <Label htmlFor="startups-status" className="sr-only">
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
          id="startups-status"
          className="min-h-11 w-full sm:min-h-8 sm:w-36"
        >
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(STATUS_LABELS) as (keyof typeof STATUS_LABELS)[]).map(
            (status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ),
          )}
        </SelectContent>
      </Select>
    </AdminFilterBar>
  );
}
