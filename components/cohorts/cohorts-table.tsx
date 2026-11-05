"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { UsersRoundIcon } from "lucide-react";

import { deleteCohort } from "@/actions/cohorts";
import { AdminClickableRow } from "@/components/dashboard/admin-clickable-row";
import {
  AdminDataTable,
  CMS_HEAD_ROW_CLASS,
} from "@/components/dashboard/admin-data-table";
import { AdminEditDeleteActions } from "@/components/dashboard/admin-edit-delete-actions";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import { CohortsFilters } from "@/components/cohorts/cohorts-filters";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { cohortEditPath, ROUTES } from "@/constants/routes";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
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
  const listFilters = {
    search: query.search || undefined,
    status: query.status === "all" ? undefined : query.status,
  };
  const isFiltered = adminListFiltersActive(listFilters);

  return (
    <AdminDataTable
      filters={<CohortsFilters query={query} />}
      header={
        <TableRow className={CMS_HEAD_ROW_CLASS}>
          <AdminRowNumberHead />
          <TableHead>Year</TableHead>
          <TableHead>Label</TableHead>
          <TableHead>Program</TableHead>
          <TableHead>Publish</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={cohorts.length === 0}
      emptyColSpan={6}
      empty={
        <AdminEmptyState
          icon={UsersRoundIcon}
          isFiltered={isFiltered}
          emptyTitle="No cohorts yet"
          emptyDescription="Create the first cohort to manage programs on the site."
          noResultsTitle="No cohorts found"
          noResultsDescription="Try changing the filters or clearing search."
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
        filters: listFilters,
      }}
    >
      {cohorts.map((cohort, index) => {
        const href = cohortEditPath(cohort.id);
        return (
          <AdminClickableRow
            key={cohort.id}
            ariaLabel={`Edit cohort ${cohort.public_label}`}
            onActivate={() => router.push(href)}
          >
            <AdminRowNumberCell
              page={query.page}
              pageSize={COHORT_PAGE_SIZE}
              index={index}
            />
            <TableCell className="tabular-nums">{cohort.year}</TableCell>
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
              <AdminEditDeleteActions
                editHref={cohortEditPath(cohort.id)}
                editLabel={`Edit ${cohort.public_label}`}
                deleteAction={() => deleteCohort({ id: cohort.id })}
                fallbackError="The cohort could not be deleted. Please try again."
                title="Delete cohort?"
                description={
                  <>
                    This permanently deletes {cohort.public_label} and its
                    partner / founder links. This cannot be undone.
                  </>
                }
                confirmLabel="Delete cohort"
                triggerLabel={`Delete ${cohort.public_label}`}
              />
            </TableCell>
          </AdminClickableRow>
        );
      })}
    </AdminDataTable>
  );
}
