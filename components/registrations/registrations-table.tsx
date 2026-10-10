"use client";

import { useCallback, useState } from "react";
import { ClipboardListIcon } from "lucide-react";

import { deleteInterestRegistration } from "@/actions/interest-registrations";
import { AdminClickableRow } from "@/components/dashboard/admin-clickable-row";
import {
  AdminDataTable,
  CMS_HEAD_ROW_CLASS,
} from "@/components/dashboard/admin-data-table";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { InboxStatusBadge } from "@/components/dashboard/inbox-status-badge";
import {
  RegistrationEditDialog,
  RegistrationRowActions,
  RegistrationViewDialog,
} from "@/components/registrations/registration-dialogs";
import { RegistrationsFilters } from "@/components/registrations/registrations-filters";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { useAdminDeleteAction } from "@/hooks/use-admin-delete-action";
import { formatAdminDate } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { InterestRegistrationListItem } from "@/types/interest-registration";
import {
  INTEREST_REGISTRATION_PAGE_SIZE,
  type InterestRegistrationListQuery,
} from "@/validations/interest-registration";

type InboxDialog =
  | { type: "view" | "edit" | "delete"; row: InterestRegistrationListItem }
  | null;

export function RegistrationsTable({
  registrations,
  total,
  totalPages,
  query,
}: {
  registrations: InterestRegistrationListItem[];
  total: number;
  totalPages: number;
  query: InterestRegistrationListQuery;
}) {
  const [dialog, setDialog] = useState<InboxDialog>(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const listFilters = {
    search: query.search,
    inboxStatus:
      query.inboxStatus === "inbox" ? undefined : query.inboxStatus,
  };
  const isFiltered = adminListFiltersActive(listFilters);
  const deleting = dialog?.type === "delete" ? dialog.row : null;
  const { isDeleting, onDelete } = useAdminDeleteAction({
    deleteAction: () =>
      deleteInterestRegistration({ id: deleting?.id ?? "" }),
    fallbackError: "The registration could not be deleted. Please try again.",
    onSuccess: closeDialog,
  });

  const onView = useCallback((row: InterestRegistrationListItem) => {
    setDialog({ type: "view", row });
  }, []);
  const onEdit = useCallback((row: InterestRegistrationListItem) => {
    setDialog({ type: "edit", row });
  }, []);
  const onDeleteRow = useCallback((row: InterestRegistrationListItem) => {
    setDialog({ type: "delete", row });
  }, []);

  return (
    <>
      <AdminDataTable
        filters={<RegistrationsFilters query={query} />}
        header={
          <TableRow className={CMS_HEAD_ROW_CLASS}>
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
            isFiltered={isFiltered}
            emptyTitle="No registrations in the inbox"
            emptyDescription="Wait for new interest submissions."
            noResultsTitle="No registrations found"
            noResultsDescription="Try changing the filters or clearing search."
          />
        }
        pagination={{
          basePath: ROUTES.registrations,
          page: query.page,
          pageSize: INTEREST_REGISTRATION_PAGE_SIZE,
          total,
          totalPages,
          filters: listFilters,
        }}
      >
        {registrations.map((registration, index) => (
          <AdminClickableRow
            key={registration.id}
            ariaLabel={`View registration from ${registration.full_name}`}
            onActivate={() => onView(registration)}
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
                onView={onView}
                onEdit={onEdit}
                onDelete={onDeleteRow}
              />
            </TableCell>
          </AdminClickableRow>
        ))}
      </AdminDataTable>

      <RegistrationViewDialog
        open={dialog?.type === "view"}
        registrationId={dialog?.type === "view" ? dialog.row.id : undefined}
        inboxStatus={
          dialog?.type === "view" ? dialog.row.inbox_status : undefined
        }
        onOpenChange={(open) => !open && closeDialog()}
      />
      <RegistrationEditDialog
        open={dialog?.type === "edit"}
        registrationId={dialog?.type === "edit" ? dialog.row.id : undefined}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <AdminDeleteDialog
        open={dialog?.type === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
        showTrigger={false}
        title="Delete registration?"
        description={
          deleting ? (
            <>
              This permanently deletes the interest registration from{" "}
              {deleting.full_name} ({deleting.email}). This cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        isPending={isDeleting}
        onConfirm={onDelete}
      />
    </>
  );
}
