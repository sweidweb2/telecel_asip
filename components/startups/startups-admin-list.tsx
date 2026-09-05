"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useTransition } from "react";
import { Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";

import { StartupAdminCard } from "@/components/startups/startup-admin-card";
import { Button } from "@/components/ui/button";
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
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { StartupListItem } from "@/types/startup";
import type { StartupListQuery } from "@/validations/startup";

type StartupsAdminListProps = {
  startups: StartupListItem[];
  total: number;
  totalPages: number;
  query: StartupListQuery;
};

export function StartupsAdminList({
  startups,
  total,
  totalPages,
  query,
}: StartupsAdminListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPagePending, startPageTransition] = useTransition();
  const { search, isPending, navigate, handleSearchChange } =
    useAdminListFilters({
      basePath: ROUTES.portfolio,
      search: query.search,
    });

  const busy = isPending || isPagePending;

  function goToPage(page: number) {
    const next = new URLSearchParams(searchParams.toString());
    if (page <= 1) next.delete("page");
    else next.set("page", String(page));
    const qs = next.toString();
    startPageTransition(() => {
      router.push(qs ? `${ROUTES.portfolio}?${qs}` : ROUTES.portfolio);
    });
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Label htmlFor="startups-search" className="sr-only">
              Search startups
            </Label>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="startups-search"
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search name or slug"
              maxLength={100}
              autoComplete="off"
              className="min-h-11 pl-9"
            />
            {isPending ? (
              <Loader2Icon className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            ) : null}
          </div>
          <Select
            value={query.status}
            onValueChange={(value) => {
              if (value) navigate({ status: value });
            }}
            disabled={busy}
          >
            <SelectTrigger className="min-h-11 w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="min-h-11 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href={ROUTES.portfolioNew} />}
        >
          <PlusIcon className="size-4" />
          New startup
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {total} startup{total === 1 ? "" : "s"}
      </p>

      {startups.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="font-heading text-lg font-semibold">No startups yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create your first portfolio company to appear on the public
            portfolio pages when set to active.
          </p>
          <Button
            className="mt-6 min-h-11"
            nativeButton={false}
            render={<Link href={ROUTES.portfolioNew} />}
          >
            <PlusIcon className="size-4" />
            New startup
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {startups.map((startup) => (
            <li key={startup.id} className="min-w-0">
              <StartupAdminCard startup={startup} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={busy || query.page <= 1}
            onClick={() => goToPage(query.page - 1)}
          >
            Previous
          </Button>
          <p className="px-2 text-sm text-muted-foreground">
            Page {query.page} of {totalPages}
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={busy || query.page >= totalPages}
            onClick={() => goToPage(query.page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
