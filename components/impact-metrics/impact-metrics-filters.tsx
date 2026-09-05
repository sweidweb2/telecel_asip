"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState, useTransition } from "react";
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
  IMPACT_LENS_LABELS,
  IMPACT_PUBLISH_STATUS_LABELS,
} from "@/constants/impact-metric-labels";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  IMPACT_LENSES,
  IMPACT_PUBLISH_STATUSES,
  type ImpactMetricListQuery,
} from "@/validations/impact-metric";

const SEARCH_DEBOUNCE_MS = 600;

export function ImpactMetricsFilters({
  query,
}: {
  query: ImpactMetricListQuery;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.search);
  const [prevQuerySearch, setPrevQuerySearch] = useState(query.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFilters =
    query.search !== "" ||
    query.lens !== "all" ||
    query.publishStatus !== "all";

  if (query.search !== prevQuerySearch) {
    setPrevQuerySearch(query.search);
    setSearch(query.search);
  }

  function cancelPendingSearch() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function navigate(changes: Record<string, string>) {
    cancelPendingSearch();

    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    next.set("page", "1");

    startTransition(() => {
      router.push(`${ROUTES.impactMetrics}?${next.toString()}`);
    });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    cancelPendingSearch();
    debounceRef.current = setTimeout(() => {
      const nextSearch = value.trim();
      if (nextSearch === query.search) return;
      navigate({ search: nextSearch });
    }, SEARCH_DEBOUNCE_MS);
  }

  return (
    <div className="flex flex-col gap-2 border-b p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Label htmlFor="impact-metrics-search" className="sr-only">
          Search impact metrics
        </Label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="impact-metrics-search"
          type="search"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Filter by claim, value, or geography…"
          maxLength={100}
          autoComplete="off"
          className="min-h-11 pl-8 sm:min-h-8"
        />
        {isPending ? (
          <Loader2Icon className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
            <SelectValue placeholder="All lenses" />
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
            <SelectValue placeholder="All statuses" />
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

        {hasFilters || search ? (
          <Link
            href={ROUTES.impactMetrics}
            aria-disabled={isPending}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "min-h-11 shrink-0 sm:min-h-8",
              isPending && "pointer-events-none opacity-50",
            )}
            onClick={() => {
              cancelPendingSearch();
              setSearch("");
            }}
          >
            <XIcon />
            Clear
          </Link>
        ) : null}
      </div>
    </div>
  );
}
