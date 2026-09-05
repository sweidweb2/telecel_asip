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
import {
  CMS_PUBLISH_STATUSES,
  CMS_PUBLISH_STATUS_LABELS,
} from "@/constants/cms-publish";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { BlogListQuery } from "@/validations/blog";

export function BlogsFilters({ query }: { query: BlogListQuery }) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.blogs,
      search: query.search,
    });

  const hasFilters = query.search !== "" || query.status !== "all";

  return (
    <AdminFilterBar
      searchId="blogs-search"
      searchLabel="Search blogs"
      searchPlaceholder="Search title, slug, or author"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.blogs}
      onClear={clearSearchLocal}
    >
      <Label htmlFor="blogs-status" className="sr-only">
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
          id="blogs-status"
          className="min-h-11 w-full sm:min-h-8 sm:w-36"
        >
          <SelectValue placeholder="All statuses" />
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
