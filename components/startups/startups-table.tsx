"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { BriefcaseIcon } from "lucide-react";

import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import { StartupRowActions } from "@/components/startups/startup-row-actions";
import { StartupsFilters } from "@/components/startups/startups-filters";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { portfolioEditPath, ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
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

  return (
    <AdminDataTable
      filters={<StartupsFilters query={query} />}
      header={
        <TableRow>
          <TableHead className="pl-4">Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="w-24 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={startups.length === 0}
      emptyColSpan={5}
      empty={
        <AdminEmptyState
          icon={BriefcaseIcon}
          title="No startups found"
          description="Try changing the filters, or create a new startup."
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
        filters: {
          search: query.search || undefined,
          status: query.status === "all" ? undefined : query.status,
        },
      }}
    >
      {startups.map((startup) => {
        const href = portfolioEditPath(startup.id);
        return (
          <TableRow
            key={startup.id}
            className="cursor-pointer"
            onClick={() => router.push(href)}
          >
            <TableCell className="max-w-[12rem] pl-4 font-medium sm:max-w-[18rem]">
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
              <StartupRowActions startup={startup} />
            </TableCell>
          </TableRow>
        );
      })}
    </AdminDataTable>
  );
}
