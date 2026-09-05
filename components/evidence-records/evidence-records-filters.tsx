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
  EVIDENCE_PERMISSION_LABELS,
  EVIDENCE_PERMISSIONS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUSES,
} from "@/constants/evidence-labels";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { EvidenceListQuery } from "@/validations/evidence-record";

export function EvidenceRecordsFilters({ query }: { query: EvidenceListQuery }) {
  const { search, isPending, navigate, handleSearchChange, clearSearchLocal } =
    useAdminListFilters({
      basePath: ROUTES.evidence,
      search: query.search,
    });

  const hasFilters =
    query.search !== "" ||
    query.status !== "all" ||
    query.permission !== "all";

  return (
    <AdminFilterBar
      searchId="evidence-search"
      searchLabel="Search evidence"
      searchPlaceholder="Filter by primary source…"
      search={search}
      isPending={isPending}
      onSearchChange={handleSearchChange}
      hasFilters={hasFilters}
      clearHref={ROUTES.evidence}
      onClear={clearSearchLocal}
    >
      <Label htmlFor="evidence-status" className="sr-only">
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
          id="evidence-status"
          className="min-h-11 w-full sm:min-h-8 sm:w-48"
        >
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {EVIDENCE_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {EVIDENCE_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Label htmlFor="evidence-permission" className="sr-only">
        Permission
      </Label>
      <Select
        value={query.permission}
        onValueChange={(value) => {
          if (value) navigate({ permission: value });
        }}
        disabled={isPending}
      >
        <SelectTrigger
          id="evidence-permission"
          className="min-h-11 w-full sm:min-h-8 sm:w-56"
        >
          <SelectValue placeholder="All permissions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All permissions</SelectItem>
          {EVIDENCE_PERMISSIONS.map((permission) => (
            <SelectItem key={permission} value={permission}>
              {EVIDENCE_PERMISSION_LABELS[permission]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </AdminFilterBar>
  );
}
