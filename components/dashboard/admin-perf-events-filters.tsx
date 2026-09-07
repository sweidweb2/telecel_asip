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
import {
  ADMIN_PERF_CACHE_STATUSES,
  ADMIN_PERF_EVENT_TYPES,
  type AdminPerfListQuery,
} from "@/validations/admin-perf-events";

const EVENT_TYPE_LABELS = Object.fromEntries(
  ADMIN_PERF_EVENT_TYPES.map((type) => [type, type]),
) as Record<(typeof ADMIN_PERF_EVENT_TYPES)[number], string>;

const CACHE_STATUS_LABELS = Object.fromEntries(
  ADMIN_PERF_CACHE_STATUSES.map((status) => [status, status]),
) as Record<(typeof ADMIN_PERF_CACHE_STATUSES)[number], string>;

export function AdminPerfEventsFilters({ query }: { query: AdminPerfListQuery }) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.performance,
      search: query.search,
    });

  const hasFilters =
    query.search !== "" ||
    query.eventType !== "all" ||
    query.cacheStatus !== "all";

  return (
    <AdminFilterBar
      searchId="admin-perf-search"
      searchLabel="Search event name"
      searchPlaceholder="Filter by name…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.performance}
      onClear={clearSearchLocal}
    >
      <Label htmlFor="admin-perf-event-type" className="sr-only">
        Event type
      </Label>
      <Select
        value={query.eventType}
        onValueChange={(value) => {
          if (value) navigate({ eventType: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="admin-perf-event-type"
          className="min-h-11 w-full sm:min-h-8 sm:w-40"
        >
          <AdminFilterSelectValue
            label="Type"
            optionLabels={EVENT_TYPE_LABELS}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {ADMIN_PERF_EVENT_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label htmlFor="admin-perf-cache-status" className="sr-only">
        Cache
      </Label>
      <Select
        value={query.cacheStatus}
        onValueChange={(value) => {
          if (value) navigate({ cacheStatus: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="admin-perf-cache-status"
          className="min-h-11 w-full sm:min-h-8 sm:w-32"
        >
          <AdminFilterSelectValue
            label="Cache"
            optionLabels={CACHE_STATUS_LABELS}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All cache</SelectItem>
          {ADMIN_PERF_CACHE_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </AdminFilterBar>
  );
}
