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
  CMS_PUBLISH_STATUSES,
  CMS_PUBLISH_STATUS_LABELS,
} from "@/constants/cms-publish";
import { ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import { cn } from "@/lib/utils";
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
    <div className="flex flex-col gap-2 border-b p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Label htmlFor="founder-stories-search" className="sr-only">
          Search founder stories
        </Label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="founder-stories-search"
          type="search"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Filter by startup name…"
          maxLength={100}
          autoComplete="off"
          className="min-h-11 pl-8 sm:min-h-8"
        />
        {isPending ? (
          <Loader2Icon className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
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

        {hasFilters || search ? (
          <Link
            href={ROUTES.founderStories}
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
