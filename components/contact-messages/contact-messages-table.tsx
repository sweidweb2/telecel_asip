"use client";

import { useCallback, useState } from "react";
import { MailIcon } from "lucide-react";

import { deleteContactMessage } from "@/actions/contact-messages";
import {
  ContactMessageEditDialog,
  ContactMessageRowActions,
  ContactMessageViewDialog,
} from "@/components/contact-messages/contact-message-dialogs";
import { ContactMessagesFilters } from "@/components/contact-messages/contact-messages-filters";
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
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { useAdminDeleteAction } from "@/hooks/use-admin-delete-action";
import { formatAdminDate } from "@/lib/admin-format";
import { adminListFiltersActive } from "@/lib/admin/list-filters-active";
import type { ContactMessageListItem } from "@/types/contact-message";
import {
  CONTACT_MESSAGE_PAGE_SIZE,
  type ContactMessageListQuery,
} from "@/validations/contact-message";

type InboxDialog =
  | { type: "view" | "edit" | "delete"; row: ContactMessageListItem }
  | null;

export function ContactMessagesTable({
  messages,
  total,
  totalPages,
  query,
}: {
  messages: ContactMessageListItem[];
  total: number;
  totalPages: number;
  query: ContactMessageListQuery;
}) {
  const [dialog, setDialog] = useState<InboxDialog>(null);
  const closeDialog = useCallback(() => setDialog(null), []);
  const listFilters = {
    search: query.search,
    enquiryType: query.enquiryType === "all" ? undefined : query.enquiryType,
    inboxStatus:
      query.inboxStatus === "inbox" ? undefined : query.inboxStatus,
  };
  const isFiltered = adminListFiltersActive(listFilters);
  const deleting = dialog?.type === "delete" ? dialog.row : null;
  const { isDeleting, onDelete } = useAdminDeleteAction({
    deleteAction: () => deleteContactMessage({ id: deleting?.id ?? "" }),
    fallbackError: "The message could not be deleted. Please try again.",
    onSuccess: closeDialog,
  });

  const onView = useCallback((row: ContactMessageListItem) => {
    setDialog({ type: "view", row });
  }, []);
  const onEdit = useCallback((row: ContactMessageListItem) => {
    setDialog({ type: "edit", row });
  }, []);
  const onDeleteRow = useCallback((row: ContactMessageListItem) => {
    setDialog({ type: "delete", row });
  }, []);

  return (
    <>
      <AdminDataTable
        filters={<ContactMessagesFilters query={query} />}
        header={
          <TableRow className={CMS_HEAD_ROW_CLASS}>
            <AdminRowNumberHead />
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="w-36 pr-4 text-right">Actions</TableHead>
          </TableRow>
        }
        isEmpty={messages.length === 0}
        emptyColSpan={7}
        empty={
          <AdminEmptyState
            icon={MailIcon}
            isFiltered={isFiltered}
            emptyTitle="No messages in the inbox"
            emptyDescription="Wait for new submissions from the contact form."
            noResultsTitle="No messages found"
            noResultsDescription="Try changing the filters or clearing search."
          />
        }
        pagination={{
          basePath: ROUTES.contactUs,
          page: query.page,
          pageSize: CONTACT_MESSAGE_PAGE_SIZE,
          total,
          totalPages,
          filters: listFilters,
        }}
      >
        {messages.map((message, index) => (
          <AdminClickableRow
            key={message.id}
            ariaLabel={`View message from ${message.full_name}`}
            onActivate={() => onView(message)}
          >
            <AdminRowNumberCell
              page={query.page}
              pageSize={CONTACT_MESSAGE_PAGE_SIZE}
              index={index}
            />
            <TableCell className="max-w-[10rem] truncate font-medium sm:max-w-[14rem]">
              {message.full_name}
            </TableCell>
            <TableCell>
              <InboxStatusBadge status={message.inbox_status} />
            </TableCell>
            <TableCell className="max-w-[11rem] truncate sm:max-w-[16rem]">
              {message.email}
            </TableCell>
            <TableCell className="whitespace-nowrap">{message.phone}</TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatAdminDate(message.created_at)}
            </TableCell>
            <TableCell
              className="pr-4"
              onClick={(event) => event.stopPropagation()}
            >
              <ContactMessageRowActions
                message={message}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDeleteRow}
              />
            </TableCell>
          </AdminClickableRow>
        ))}
      </AdminDataTable>

      <ContactMessageViewDialog
        open={dialog?.type === "view"}
        messageId={dialog?.type === "view" ? dialog.row.id : undefined}
        inboxStatus={dialog?.type === "view" ? dialog.row.inbox_status : undefined}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <ContactMessageEditDialog
        open={dialog?.type === "edit"}
        messageId={dialog?.type === "edit" ? dialog.row.id : undefined}
        onOpenChange={(open) => !open && closeDialog()}
      />
      <AdminDeleteDialog
        open={dialog?.type === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
        showTrigger={false}
        title="Delete message?"
        description={
          deleting ? (
            <>
              This permanently deletes the message from {deleting.full_name} (
              {deleting.email}). This cannot be undone.
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
