"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { BriefcaseIcon } from "lucide-react";

import { deleteStartup } from "@/actions/startups";
import { AdminClickableRow } from "@/components/dashboard/admin-clickable-row";
import {
  AdminDataTable,
  CMS_HEAD_ROW_CLASS,
} from "@/components/dashboard/admin-data-table";
import { AdminEditDeleteActions } from "@/components/dashboard/admin-edit-delete-actions";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { StartupsFilters } from "@/components/startups/startups-filters";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { portfolioEditPath, ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { StartupListItem } from "@/types/startup";
import {
  STARTUP_PAGE_SIZE,
  type StartupListQuery,
} from "@/validations/startup";

const STATUS_VARIANT = {
  draft: "secondary",
  active: "default",
  inactive: "outline",
} as const;

const STATUS_LABEL = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
} as const;

export function StartupsTable({
  startups,
  total,
  totalPages,
  query,
}: {
  startups: StartupListItem[];
  total: number;
  totalPages: number;
  query: StartupListQuery;
}) {
  const router = useRouter();
  const listFilters = {
    search: query.search || undefined,
    status: query.status === "all" ? undefined : query.status,
  };
  const isFiltered = adminListFiltersActive(listFilters);

  return (
    <AdminDataTable
      filters={<StartupsFilters query={query} />}
      header={
        <TableRow className={CMS_HEAD_ROW_CLASS}>
          <AdminRowNumberHead />
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={startups.length === 0}
      emptyColSpan={6}
      empty={
        <AdminEmptyState
          icon={BriefcaseIcon}
          isFiltered={isFiltered}
          emptyTitle="No startups yet"
          emptyDescription="Create the first portfolio startup to publish on the site."
          noResultsTitle="No startups found"
          noResultsDescription="Try changing the filters or clearing search."
          createHref={ROUTES.portfolioNew}
          createLabel="New startup"
        />
      }
      pagination={{
        basePath: ROUTES.portfolio,
        page: query.page,
        pageSize: STARTUP_PAGE_SIZE,
        total,
        totalPages,
        filters: listFilters,
      }}
    >
      {startups.map((startup, index) => {
        const href = portfolioEditPath(startup.id);
        return (
          <AdminClickableRow
            key={startup.id}
            ariaLabel={`Edit startup ${startup.name}`}
            onActivate={() => router.push(href)}
          >
            <AdminRowNumberCell
              page={query.page}
              pageSize={STARTUP_PAGE_SIZE}
              index={index}
            />
            <TableCell className="max-w-[12rem] font-medium sm:max-w-[18rem]">
              <Link
                href={href}
                title={startup.name}
                className="block truncate hover:underline"
                onClick={(event) => event.stopPropagation()}
              >
                {startup.name}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[startup.status]}>
                {STATUS_LABEL[startup.status]}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[10rem] truncate text-muted-foreground">
              {startup.slug}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatAdminDate(startup.updated_at)}
            </TableCell>
            <TableCell
              className="pr-4 text-right"
              onClick={(event) => event.stopPropagation()}
            >
              <AdminEditDeleteActions
                editHref={portfolioEditPath(startup.id)}
                editLabel={`Edit ${startup.name}`}
                deleteAction={() => deleteStartup({ id: startup.id })}
                fallbackError="The startup could not be deleted. Please try again."
                title="Delete startup?"
                description={
                  <>
                    This permanently deletes {startup.name} and its logo. This
                    cannot be undone.
                  </>
                }
                confirmLabel="Delete startup"
                triggerLabel={`Delete ${startup.name}`}
              />
            </TableCell>
          </AdminClickableRow>
        );
      })}
    </AdminDataTable>
  );
}
