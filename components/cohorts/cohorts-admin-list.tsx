"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useTransition } from "react";
import { Loader2Icon, PlusIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { cohortEditPath, ROUTES } from "@/constants/routes";
import { useAdminListFilters } from "@/hooks/use-admin-list-filters";
import type { CohortListItem } from "@/types/cohort";
import {
  CMS_PUBLISH_STATUS_LABELS,
  COHORT_PROGRAMME_STATUS_LABELS,
  type CohortListQuery,
} from "@/validations/cohort";

type CohortsAdminListProps = {
  cohorts: CohortListItem[];
  total: number;
  totalPages: number;
  query: CohortListQuery;
};

export function CohortsAdminList({
  cohorts,
  total,
  totalPages,
  query,
}: CohortsAdminListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPagePending, startPageTransition] = useTransition();
  const { search, isPending, navigate, handleSearchChange } =
    useAdminListFilters({
      basePath: ROUTES.cohorts,
      search: query.search,
    });

  const busy = isPending || isPagePending;

  function goToPage(page: number) {
    const next = new URLSearchParams(searchParams.toString());
    if (page <= 1) next.delete("page");
    else next.set("page", String(page));
    const qs = next.toString();
    startPageTransition(() => {
      router.push(qs ? `${ROUTES.cohorts}?${qs}` : ROUTES.cohorts);
    });
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Label htmlFor="cohorts-search" className="sr-only">
              Search cohorts
            </Label>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="cohorts-search"
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search public label"
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
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          className="min-h-11 w-full sm:w-auto"
          nativeButton={false}
          render={<Link href={ROUTES.cohortsNew} />}
        >
          <PlusIcon className="size-4" />
          New cohort
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {total} cohort{total === 1 ? "" : "s"}
      </p>

      {cohorts.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center">
          <p className="font-heading text-lg font-semibold">No cohorts yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a cohort year to link partners and founders for the archive.
          </p>
          <Button
            className="mt-6 min-h-11"
            nativeButton={false}
            render={<Link href={ROUTES.cohortsNew} />}
          >
            <PlusIcon className="size-4" />
            New cohort
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Year</th>
                <th className="px-4 py-3 font-medium">Label</th>
                <th className="px-4 py-3 font-medium">Programme</th>
                <th className="px-4 py-3 font-medium">Publish</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => (
                <tr key={cohort.id} className="border-b last:border-0">
                  <td className="px-4 py-3 tabular-nums">{cohort.year}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={cohortEditPath(cohort.id)}
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {cohort.public_label}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {
                      COHORT_PROGRAMME_STATUS_LABELS[
                        cohort.programme_status
                      ]
                    }
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        cohort.publish_status === "published"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {CMS_PUBLISH_STATUS_LABELS[cohort.publish_status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={busy || query.page <= 1}
            onClick={() => goToPage(Math.max(1, query.page - 1))}
          >
            Previous
          </Button>
          <p className="text-sm text-muted-foreground">
            Page {query.page} of {totalPages}
          </p>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={busy || query.page >= totalPages}
            onClick={() =>
              goToPage(Math.min(totalPages, query.page + 1))
            }
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
