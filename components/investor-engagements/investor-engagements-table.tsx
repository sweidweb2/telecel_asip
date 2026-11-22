"use client";

import { useCallback, useState } from "react";
import { HandCoinsIcon } from "lucide-react";

import { deleteInvestorEngagement } from "@/actions/investor-engagements";
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
  InvestorEngagementEditDialog,
  InvestorEngagementRowActions,
  InvestorEngagementViewDialog,
} from "@/components/investor-engagements/investor-engagement-dialogs";
import { InvestorEngagementsFilters } from "@/components/investor-engagements/investor-engagements-filters";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { useAdminDeleteAction } from "@/hooks/use-admin-delete-action";
import { formatAdminDate } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { InvestorEngagementListItem } from "@/types/investor-engagement";
import {
  INVESTOR_ENGAGEMENT_PAGE_SIZE,
  type InvestorEngagementListQuery,
} from "@/validations/investor-engagement";

type InboxDialog =
  | { type: "view" | "edit" | "delete"; row: InvestorEngagementListItem }
  | null;

export function InvestorEngagementsTable({
  engagements,
  total,
  totalPages,
  query,
}: {
  engagements: InvestorEngagementListItem[];
  total: number;
  totalPages: number;
  query: InvestorEngagementListQuery;
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
    deleteAction: () => deleteInvestorEngagement({ id: deleting?.id ?? "" }),
    fallbackError:
      "The investor engagement could not be deleted. Please try again.",
    onSuccess: closeDialog,
  });

  const onView = useCallback((row: InvestorEngagementListItem) => {
    setDialog({ type: "view", row });
  }, []);
  const onEdit = useCallback((row: InvestorEngagementListItem) => {
    setDialog({ type: "edit", row });
  }, []);
  const onDeleteRow = useCallback((row: InvestorEngagementListItem) => {
    setDialog({ type: "delete", row });
  }, []);

  return (
    <>
      <AdminDataTable
        filters={<InvestorEngagementsFilters query={query} />}
        header={
          <TableRow className={CMS_HEAD_ROW_CLASS}>
            <AdminRowNumberHead />
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Organisation</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="w-36 pr-4 text-right">Actions</TableHead>
          </TableRow>
        }
        isEmpty={engagements.length === 0}
        emptyColSpan={7}
        empty={
          <AdminEmptyState
            icon={HandCoinsIcon}
            isFiltered={isFiltered}
            emptyTitle="No investor engagements in the inbox"
            emptyDescription="Wait for new investor engagement submissions."
            noResultsTitle="No investor engagements found"
            noResultsDescription="Try changing the filters or clearing search."
          />
        }
        pagination={{
          basePath: ROUTES.investorEngagements,
          page: query.page,
          pageSize: INVESTOR_ENGAGEMENT_PAGE_SIZE,
          total,
          totalPages,
          filters: listFilters,
        }}
      >
        {engagements.map((engagement, index) => (
          <AdminClickableRow
            key={engagement.id}
            ariaLabel={`View investor engagement from ${engagement.full_name}`}
            onActivate={() => onView(engagement)}
          >
            <AdminRowNumberCell
              page={query.page}
              pageSize={INVESTOR_ENGAGEMENT_PAGE_SIZE}
              index={index}
            />
            <TableCell className="max-w-[10rem] truncate font-medium sm:max-w-[14rem]">
              {engagement.full_name}
            </TableCell>
            <TableCell>
              <InboxStatusBadge status={engagement.inbox_status} />
            </TableCell>
            <TableCell className="max-w-[11rem] truncate sm:max-w-[16rem]">
              {engagement.email}
            </TableCell>
            <TableCell className="max-w-[10rem] truncate sm:max-w-[14rem]">
              {engagement.organization}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatAdminDate(engagement.created_at)}
            </TableCell>
            <TableCell
              className="pr-4"
              onClick={(event) => event.stopPropagation()}
            >
              <InvestorEngagementRowActions
                engagement={engagement}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDeleteRow}
              />
            </TableCell>
          </AdminClickableRow>
        ))}
      </AdminDataTable>

      <InvestorEngagementViewDialog
        open={dialog?.type === "view"}
        engagementId={dialog?.type === "view" ? dialog.row.id : undefined}
        inboxStatus={
          dialog?.type === "view" ? dialog.row.inbox_status : undefined
        }
        onOpenChange={(open) => !open && closeDialog()}
      />
      <InvestorEngagementEditDialog
        open={dialog?.type === "edit"}
        engagementId={dialog?.type === "edit" ? dialog.row.id : undefined}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <AdminDeleteDialog
        open={dialog?.type === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
        showTrigger={false}
        title="Delete investor engagement?"
        description={
          deleting ? (
            <>
              This permanently deletes the investor engagement from{" "}
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
