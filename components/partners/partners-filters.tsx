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
import { PARTNER_TYPE_LABELS } from "@/constants/partner-types";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import { PARTNER_TYPES, type PartnerListQuery } from "@/validations/partner";

export function PartnersFilters({ query }: { query: PartnerListQuery }) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.partners,
      search: query.search,
    });

  const hasFilters =
    query.search !== "" || query.type !== "all" || query.status !== "all";

  return (
    <AdminFilterBar
      searchId="partners-search"
      searchLabel="Search partners"
      searchPlaceholder="Filter by name or organisation…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.partners}
      onClear={clearSearchLocal}
    >
      <Label htmlFor="partners-type" className="sr-only">
        Partner type
      </Label>
      <Select
        value={query.type}
        onValueChange={(value) => {
          if (value) navigate({ type: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="partners-type"
          className="min-h-11 w-full sm:min-h-8 sm:w-52"
        >
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {PARTNER_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {PARTNER_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label htmlFor="partners-status" className="sr-only">
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
          id="partners-status"
          className="min-h-11 w-full sm:min-h-8 sm:w-36"
        >
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="historical">Historical</SelectItem>
        </SelectContent>
      </Select>
    </AdminFilterBar>
  );
}
