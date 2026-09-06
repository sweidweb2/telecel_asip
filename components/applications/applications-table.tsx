"use client";

import { useState } from "react";
import { FileTextIcon } from "lucide-react";

import { ApplicationRowActions } from "@/components/applications/application-row-actions";
import { ApplicationsFilters } from "@/components/applications/applications-filters";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { InboxStatusBadge } from "@/components/dashboard/inbox-status-badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import type { Application } from "@/types/application";
import {
  APPLICATION_PAGE_SIZE,
  type ApplicationListQuery,
} from "@/validations/application";

export function ApplicationsTable({
  applications,
  total,
  totalPages,
  query,
}: {
  applications: Application[];
  total: number;
  totalPages: number;
  query: ApplicationListQuery;
}) {
  const [viewId, setViewId] = useState<string | null>(null);

  return (
    <AdminDataTable
      filters={<ApplicationsFilters query={query} />}
      header={
        <TableRow>
          <AdminRowNumberHead />
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Startup</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="w-36 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={applications.length === 0}
      emptyColSpan={7}
      empty={
        <AdminEmptyState
          icon={FileTextIcon}
          title="No applications found"
          description="Try changing the search or inbox filter. Official Apply submissions appear here; leads stay under Registrations."
        />
      }
      pagination={{
        basePath: ROUTES.applications,
        page: query.page,
        pageSize: APPLICATION_PAGE_SIZE,
        total,
        totalPages,
        filters: {
          search: query.search,
          inboxStatus:
            query.inboxStatus === "inbox" ? undefined : query.inboxStatus,
        },
      }}
    >
      {applications.map((application, index) => (
        <TableRow
          key={application.id}
          className="cursor-pointer"
          onClick={() => setViewId(application.id)}
        >
          <AdminRowNumberCell
            page={query.page}
            pageSize={APPLICATION_PAGE_SIZE}
            index={index}
          />
          <TableCell className="max-w-[10rem] truncate font-medium sm:max-w-[14rem]">
            {application.full_name}
          </TableCell>
          <TableCell>
            <InboxStatusBadge status={application.inbox_status} />
          </TableCell>
          <TableCell className="max-w-[12rem] truncate text-muted-foreground">
            {application.email}
          </TableCell>
          <TableCell className="max-w-[10rem] truncate">
            {application.company_name}
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">
            {formatAdminDate(application.created_at)}
          </TableCell>
          <TableCell
            className="pr-4"
            onClick={(event) => event.stopPropagation()}
          >
            <ApplicationRowActions
              application={application}
              viewOpen={viewId === application.id}
              onViewOpenChange={(open) =>
                setViewId(open ? application.id : null)
              }
            />
          </TableCell>
        </TableRow>
      ))}
    </AdminDataTable>
  );
}
