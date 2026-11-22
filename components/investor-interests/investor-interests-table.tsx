"use client";

import { useCallback, useState } from "react";
import { LandmarkIcon } from "lucide-react";

import { deleteInvestorInterest } from "@/actions/investor-interests";
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
  InvestorInterestEditDialog,
  InvestorInterestRowActions,
  InvestorInterestViewDialog,
} from "@/components/investor-interests/investor-interest-dialogs";
import { InvestorInterestsFilters } from "@/components/investor-interests/investor-interests-filters";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { useAdminDeleteAction } from "@/hooks/use-admin-delete-action";
import { formatAdminDate } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { InvestorInterestListItem } from "@/types/investor-interest";
import {
  INVESTOR_INTEREST_PAGE_SIZE,
  type InvestorInterestListQuery,
} from "@/validations/investor-interest";

type InboxDialog =
  | { type: "view" | "edit" | "delete"; row: InvestorInterestListItem }
  | null;

export function InvestorInterestsTable({
  interests,
  total,
  totalPages,
  query,
}: {
  interests: InvestorInterestListItem[];
  total: number;
  totalPages: number;
  query: InvestorInterestListQuery;
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
    deleteAction: () => deleteInvestorInterest({ id: deleting?.id ?? "" }),
    fallbackError: "The investor interest could not be deleted. Please try again.",
    onSuccess: closeDialog,
  });

  const onView = useCallback((row: InvestorInterestListItem) => {
    setDialog({ type: "view", row });
  }, []);
  const onEdit = useCallback((row: InvestorInterestListItem) => {
    setDialog({ type: "edit", row });
  }, []);
  const onDeleteRow = useCallback((row: InvestorInterestListItem) => {
    setDialog({ type: "delete", row });
  }, []);

  return (
    <>
      <AdminDataTable
        filters={<InvestorInterestsFilters query={query} />}
        header={
          <TableRow className={CMS_HEAD_ROW_CLASS}>
            <AdminRowNumberHead />
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="w-36 pr-4 text-right">Actions</TableHead>
          </TableRow>
        }
        isEmpty={interests.length === 0}
        emptyColSpan={7}
        empty={
          <AdminEmptyState
            icon={LandmarkIcon}
            isFiltered={isFiltered}
            emptyTitle="No investor interests in the inbox"
            emptyDescription="Wait for new investor interest submissions."
            noResultsTitle="No investor interests found"
            noResultsDescription="Try changing the filters or clearing search."
          />
        }
        pagination={{
          basePath: ROUTES.investorInterests,
          page: query.page,
          pageSize: INVESTOR_INTEREST_PAGE_SIZE,
          total,
          totalPages,
          filters: listFilters,
        }}
      >
        {interests.map((interest, index) => (
          <AdminClickableRow
            key={interest.id}
            ariaLabel={`View investor interest from ${interest.full_name}`}
            onActivate={() => onView(interest)}
          >
            <AdminRowNumberCell
              page={query.page}
              pageSize={INVESTOR_INTEREST_PAGE_SIZE}
              index={index}
            />
            <TableCell className="max-w-[10rem] truncate font-medium sm:max-w-[14rem]">
              {interest.full_name}
            </TableCell>
            <TableCell>
              <InboxStatusBadge status={interest.inbox_status} />
            </TableCell>
            <TableCell className="max-w-[11rem] truncate sm:max-w-[16rem]">
              {interest.email}
            </TableCell>
            <TableCell className="max-w-[10rem] truncate sm:max-w-[14rem]">
              {interest.organization}
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatAdminDate(interest.created_at)}
            </TableCell>
            <TableCell
              className="pr-4"
              onClick={(event) => event.stopPropagation()}
            >
              <InvestorInterestRowActions
                interest={interest}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDeleteRow}
              />
            </TableCell>
          </AdminClickableRow>
        ))}
      </AdminDataTable>

      <InvestorInterestViewDialog
        open={dialog?.type === "view"}
        interestId={dialog?.type === "view" ? dialog.row.id : undefined}
        inboxStatus={
          dialog?.type === "view" ? dialog.row.inbox_status : undefined
        }
        onOpenChange={(open) => !open && closeDialog()}
      />
      <InvestorInterestEditDialog
        open={dialog?.type === "edit"}
        interestId={dialog?.type === "edit" ? dialog.row.id : undefined}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <AdminDeleteDialog
        open={dialog?.type === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
        showTrigger={false}
        title="Delete investor interest?"
        description={
          deleting ? (
            <>
              This permanently deletes the investor interest from{" "}
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
