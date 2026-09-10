"use client";

import { useCallback, useState } from "react";
import { FileTextIcon } from "lucide-react";

import {
  ApplicationEditDialog,
  ApplicationViewDialog,
} from "@/components/applications/application-dialogs";
import { ApplicationRowActions } from "@/components/applications/application-row-actions";
import { ApplicationsFilters } from "@/components/applications/applications-filters";
import { AdminClickableRow } from "@/components/dashboard/admin-clickable-row";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminDeleteDialog } from "@/components/dashboard/admin-delete-dialog";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import {
  AdminRowNumberCell,
  AdminRowNumberHead,
} from "@/components/dashboard/admin-row-number";
import { InboxStatusBadge } from "@/components/dashboard/inbox-status-badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { deleteApplication } from "@/actions/applications";
import { useAdminDeleteAction } from "@/hooks/use-admin-delete-action";
import { formatAdminDate } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { ApplicationListItem } from "@/types/application";
import {
  APPLICATION_PAGE_SIZE,
  type ApplicationListQuery,
} from "@/validations/application";

type InboxDialog =
  | { type: "view" | "edit" | "delete"; row: ApplicationListItem }
  | null;

export function ApplicationsTable({
  applications,
  total,
  totalPages,
  query,
}: {
  applications: ApplicationListItem[];
  total: number;
  totalPages: number;
  query: ApplicationListQuery;
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
    deleteAction: () => deleteApplication({ id: deleting?.id ?? "" }),
    fallbackError: "The application could not be deleted. Please try again.",
    onSuccess: closeDialog,
  });

  const onView = useCallback((row: ApplicationListItem) => {
    setDialog({ type: "view", row });
  }, []);
  const onEdit = useCallback((row: ApplicationListItem) => {
    setDialog({ type: "edit", row });
  }, []);
  const onDeleteRow = useCallback((row: ApplicationListItem) => {
    setDialog({ type: "delete", row });
  }, []);

  return (
    <>
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
            isFiltered={isFiltered}
            emptyTitle="No applications in the inbox"
            emptyDescription="Official Apply submissions appear here; leads stay under Registrations. Wait for new submissions."
            noResultsTitle="No applications found"
            noResultsDescription="Try changing the filters or clearing search."
          />
        }
        pagination={{
          basePath: ROUTES.applications,
          page: query.page,
          pageSize: APPLICATION_PAGE_SIZE,
          total,
          totalPages,
          filters: listFilters,
        }}
      >
        {applications.map((application, index) => (
          <AdminClickableRow
            key={application.id}
            ariaLabel={`View application from ${application.full_name}`}
            onActivate={() => onView(application)}
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
                onView={onView}
                onEdit={onEdit}
                onDelete={onDeleteRow}
              />
            </TableCell>
          </AdminClickableRow>
        ))}
      </AdminDataTable>

      <ApplicationViewDialog
        open={dialog?.type === "view"}
        applicationId={dialog?.type === "view" ? dialog.row.id : undefined}
        inboxStatus={dialog?.type === "view" ? dialog.row.inbox_status : undefined}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <ApplicationEditDialog
        open={dialog?.type === "edit"}
        applicationId={dialog?.type === "edit" ? dialog.row.id : undefined}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <AdminDeleteDialog
        open={dialog?.type === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
        showTrigger={false}
        title="Delete application?"
        description={
          deleting ? (
            <>
              This permanently deletes the application from {deleting.full_name}{" "}
              ({deleting.company_name}). This cannot be undone.
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
