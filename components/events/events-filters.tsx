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
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import {
  CMS_PUBLISH_STATUSES,
  CMS_PUBLISH_STATUS_LABELS,
  type EventListQuery,
} from "@/validations/event";

const SEARCH_DEBOUNCE_MS = 600;

export function EventsFilters({ query }: { query: EventListQuery }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.search);
  const [prevQuerySearch, setPrevQuerySearch] = useState(query.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFilters = query.search !== "" || query.status !== "all";

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
      router.push(`${ROUTES.events}?${next.toString()}`);
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
        <Label htmlFor="events-search" className="sr-only">
          Search events
        </Label>
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="events-search"
          type="search"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Filter by name…"
          maxLength={100}
          autoComplete="off"
          className="min-h-11 pl-8 sm:min-h-8"
        />
        {isPending ? (
          <Loader2Icon className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor="events-status" className="sr-only">
          Publish status
        </Label>
        <Select
          value={query.status}
          onValueChange={(value) => {
            if (value) navigate({ status: value });
          }}
          disabled={isPending}
        >
          <SelectTrigger
            id="events-status"
            className="min-h-11 w-full sm:min-h-8 sm:w-40"
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
            href={ROUTES.events}
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
