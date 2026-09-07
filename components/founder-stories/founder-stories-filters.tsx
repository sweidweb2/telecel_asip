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
import type { FounderStoryListQuery } from "@/validations/founder-story";

export function FounderStoriesFilters({
  query,
}: {
  query: FounderStoryListQuery;
}) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.founderStories,
      search: query.search,
    });

  const hasFilters = query.search !== "" || query.status !== "all";

  return (
    <AdminFilterBar
      searchId="founder-stories-search"
      searchLabel="Search founder stories"
      searchPlaceholder="Filter by startup name…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.founderStories}
      onClear={clearSearchLocal}
    >
      <Label htmlFor="founder-stories-status" className="sr-only">
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
          id="founder-stories-status"
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
