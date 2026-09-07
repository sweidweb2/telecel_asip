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
  IMPACT_LENS_LABELS,
  IMPACT_PUBLISH_STATUS_LABELS,
} from "@/constants/impact-metric-labels";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import {
  IMPACT_LENSES,
  IMPACT_PUBLISH_STATUSES,
  type ImpactMetricListQuery,
} from "@/validations/impact-metric";

export function ImpactMetricsFilters({
  query,
}: {
  query: ImpactMetricListQuery;
}) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.impactMetrics,
      search: query.search,
    });

  const hasFilters =
    query.search !== "" ||
    query.lens !== "all" ||
    query.publishStatus !== "all";

  return (
    <AdminFilterBar
      searchId="impact-metrics-search"
      searchLabel="Search impact metrics"
      searchPlaceholder="Filter by claim, value, or geography…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.impactMetrics}
      onClear={clearSearchLocal}
    >
      <Label htmlFor="impact-metrics-lens" className="sr-only">
        Impact lens
      </Label>
      <Select
        value={query.lens}
        onValueChange={(value) => {
          if (value) navigate({ lens: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="impact-metrics-lens"
          className="min-h-11 w-full sm:min-h-8 sm:w-52"
        >
          <AdminFilterSelectValue
            label="Lens"
            optionLabels={IMPACT_LENS_LABELS}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All lenses</SelectItem>
          {IMPACT_LENSES.map((lens) => (
            <SelectItem key={lens} value={lens}>
              {IMPACT_LENS_LABELS[lens]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label htmlFor="impact-metrics-status" className="sr-only">
        Publish status
      </Label>
      <Select
        value={query.publishStatus}
        onValueChange={(value) => {
          if (value) navigate({ publishStatus: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="impact-metrics-status"
          className="min-h-11 w-full sm:min-h-8 sm:w-44"
        >
          <AdminFilterSelectValue
            label="Status"
            optionLabels={IMPACT_PUBLISH_STATUS_LABELS}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {IMPACT_PUBLISH_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {IMPACT_PUBLISH_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </AdminFilterBar>
  );
}
