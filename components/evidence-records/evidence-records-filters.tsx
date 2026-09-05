"use client";

import Link from "next/link";
import { Loader2Icon, SearchIcon, XIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  EVIDENCE_PERMISSION_LABELS,
  EVIDENCE_PERMISSIONS,
  EVIDENCE_STATUS_LABELS,
  EVIDENCE_STATUSES,
} from "@/constants/evidence-labels";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import { cn } from "@/lib/utils";
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
    <div className="flex flex-col gap-2 border-b p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Label htmlFor="evidence-search" className="sr-only">
          Search evidence
        </Label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="evidence-search"
          type="search"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Filter by primary source…"
          maxLength={100}
          autoComplete="off"
          className="min-h-11 pl-8 sm:min-h-8"
        />
        {isPending ? (
          <Loader2Icon className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
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

        {hasFilters || search ? (
          <Link
            href={ROUTES.evidence}
            aria-disabled={isPending}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "min-h-11 shrink-0 sm:min-h-8",
              isPending && "pointer-events-none opacity-50",
            )}
            onClick={clearSearchLocal}
          >
            <XIcon />
            Clear
          </Link>
        ) : null}
      </div>
    </div>
  );
}
