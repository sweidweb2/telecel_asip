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
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { StartupListQuery } from "@/validations/startup";

const STATUS_OPTION_LABELS = {
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
          <AdminFilterSelectValue
            label="Status"
            optionLabels={STATUS_OPTION_LABELS}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {(
            Object.keys(STATUS_OPTION_LABELS) as (keyof typeof STATUS_OPTION_LABELS)[]
          ).map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_OPTION_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </AdminFilterBar>
  );
}
