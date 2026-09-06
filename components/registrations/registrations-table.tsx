"use client";

import { useState } from "react";
import { ClipboardListIcon } from "lucide-react";

import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { InboxStatusBadge } from "@/components/dashboard/inbox-status-badge";
import { RegistrationRowActions } from "@/components/registrations/registration-dialogs";
import { RegistrationsFilters } from "@/components/registrations/registrations-filters";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import type { InterestRegistration } from "@/types/interest-registration";
import {
  INTEREST_REGISTRATION_PAGE_SIZE,
  type InterestRegistrationListQuery,
} from "@/validations/interest-registration";

export function RegistrationsTable({
  registrations,
  total,
  totalPages,
  query,
}: {
  registrations: InterestRegistration[];
  total: number;
  totalPages: number;
  query: InterestRegistrationListQuery;
}) {
  const [viewId, setViewId] = useState<string | null>(null);

  return (
    <AdminDataTable
      filters={<RegistrationsFilters query={query} />}
      header={
        <TableRow>
          <AdminRowNumberHead />
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="w-36 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={registrations.length === 0}
      emptyColSpan={7}
      empty={
        <AdminEmptyState
          icon={ClipboardListIcon}
          title="No registrations found"
          description="Try changing the search or inbox filter, or wait for new interest submissions."
        />
      }
      pagination={{
        basePath: ROUTES.registrations,
        page: query.page,
        pageSize: INTEREST_REGISTRATION_PAGE_SIZE,
        total,
        totalPages,
        filters: {
          search: query.search,
          inboxStatus:
            query.inboxStatus === "inbox" ? undefined : query.inboxStatus,
        },
      }}
    >
      {registrations.map((registration, index) => (
        <TableRow
          key={registration.id}
          className="cursor-pointer"
          onClick={() => setViewId(registration.id)}
        >
          <AdminRowNumberCell
            page={query.page}
            pageSize={INTEREST_REGISTRATION_PAGE_SIZE}
            index={index}
          />
          <TableCell className="max-w-[10rem] truncate font-medium sm:max-w-[14rem]">
            {registration.full_name}
          </TableCell>
          <TableCell>
            <InboxStatusBadge status={registration.inbox_status} />
          </TableCell>
          <TableCell className="max-w-[11rem] truncate sm:max-w-[16rem]">
            {registration.email}
          </TableCell>
          <TableCell className="max-w-[10rem] truncate sm:max-w-[14rem]">
            {registration.company_name}
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">
            {formatAdminDate(registration.created_at)}
          </TableCell>
          <TableCell
            className="pr-4"
            onClick={(event) => event.stopPropagation()}
          >
            <RegistrationRowActions
              registration={registration}
              viewOpen={viewId === registration.id}
              onViewOpenChange={(open) =>
                setViewId(open ? registration.id : null)
              }
            />
          </TableCell>
        </TableRow>
      ))}
    </AdminDataTable>
  );
}
