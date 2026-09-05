"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { UsersRoundIcon } from "lucide-react";

import { CohortRowActions } from "@/components/cohorts/cohort-row-actions";
import { CohortsFilters } from "@/components/cohorts/cohorts-filters";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { cohortEditPath, ROUTES } from "@/constants/routes";
import type { CohortListItem } from "@/types/cohort";
import {
  CMS_PUBLISH_STATUS_LABELS,
  COHORT_PAGE_SIZE,
  COHORT_PROGRAMME_STATUS_LABELS,
  type CohortListQuery,
} from "@/validations/cohort";

export function CohortsTable({
  cohorts,
  total,
  totalPages,
  query,
}: {
  cohorts: CohortListItem[];
  total: number;
  totalPages: number;
  query: CohortListQuery;
}) {
  const router = useRouter();

  return (
    <AdminDataTable
      filters={<CohortsFilters query={query} />}
      header={
        <TableRow>
          <TableHead className="pl-4">Year</TableHead>
          <TableHead>Label</TableHead>
          <TableHead>Programme</TableHead>
          <TableHead>Publish</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={cohorts.length === 0}
      emptyColSpan={5}
      empty={
        <AdminEmptyState
          icon={UsersRoundIcon}
          title="No cohorts found"
          description="Try changing the filters, or create a new cohort."
          createHref={ROUTES.cohortsNew}
          createLabel="New cohort"
        />
      }
      pagination={{
        basePath: ROUTES.cohorts,
        page: query.page,
        pageSize: COHORT_PAGE_SIZE,
        total,
        totalPages,
        filters: {
          search: query.search || undefined,
          status: query.status === "all" ? undefined : query.status,
        },
      }}
    >
      {cohorts.map((cohort) => {
        const href = cohortEditPath(cohort.id);
        return (
          <TableRow
            key={cohort.id}
            className="cursor-pointer"
            onClick={() => router.push(href)}
          >
            <TableCell className="pl-4 tabular-nums">{cohort.year}</TableCell>
            <TableCell className="max-w-[12rem] font-medium sm:max-w-[18rem]">
              <Link
                href={href}
                title={cohort.public_label}
                className="block truncate hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {cohort.public_label}
              </Link>
            </TableCell>
            <TableCell>
              {COHORT_PROGRAMME_STATUS_LABELS[cohort.programme_status]}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  cohort.publish_status === "published"
                    ? "default"
                    : "secondary"
                }
              >
                {CMS_PUBLISH_STATUS_LABELS[cohort.publish_status]}
              </Badge>
            </TableCell>
            <TableCell
              className="pr-4 text-right"
              onClick={(event) => event.stopPropagation()}
            >
              <CohortRowActions cohort={cohort} />
            </TableCell>
          </TableRow>
        );
      })}
    </AdminDataTable>
  );
}
