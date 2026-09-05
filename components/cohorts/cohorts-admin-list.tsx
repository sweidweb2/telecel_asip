"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useTransition } from "react";
import { PlusIcon, SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cohortEditPath, ROUTES } from "@/constants/routes";
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
  const [isPending, startTransition] = useTransition();

  function updateParams(patch: Record<string, string>) {
    const params = new URLSearchParams();
    const next = {
      page: String(query.page),
      search: query.search,
      status: query.status,
      ...patch,
    };
    if (next.page !== "1") params.set("page", next.page);
    if (next.search) params.set("search", next.search);
    if (next.status !== "all") params.set("status", next.status);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${ROUTES.cohorts}?${qs}` : ROUTES.cohorts);
    });
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            updateParams({
              search: String(form.get("search") ?? "").trim(),
              page: "1",
            });
          }}
        >
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              key={query.search}
              name="search"
              defaultValue={query.search}
              placeholder="Search public label"
              className="min-h-11 pl-9"
              disabled={isPending}
            />
          </div>
          <Select
            value={query.status}
            onValueChange={(value) => {
              if (!value) return;
              updateParams({ status: value, page: "1" });
            }}
            disabled={isPending}
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
          <Button type="submit" variant="secondary" className="min-h-11">
            Search
          </Button>
        </form>
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
            disabled={isPending || query.page <= 1}
            onClick={() =>
              updateParams({ page: String(Math.max(1, query.page - 1)) })
            }
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
            disabled={isPending || query.page >= totalPages}
            onClick={() =>
              updateParams({
                page: String(Math.min(totalPages, query.page + 1)),
              })
            }
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
