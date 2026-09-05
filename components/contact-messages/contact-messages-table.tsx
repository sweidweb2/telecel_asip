"use client";

import { useState } from "react";
import { MailIcon } from "lucide-react";

import { ContactMessageRowActions } from "@/components/contact-messages/contact-message-dialogs";
import { ContactMessagesFilters } from "@/components/contact-messages/contact-messages-filters";
import { AdminDataTable } from "@/components/dashboard/admin-data-table";
import { AdminEmptyState } from "@/components/dashboard/admin-empty-state";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { CONTACT_ENQUIRY_ADMIN_LABELS } from "@/constants/contact-enquiry";
import { ROUTES } from "@/constants/routes";
import { formatAdminDate } from "@/lib/admin-format";
import type { ContactMessage } from "@/types/contact-message";
import {
  CONTACT_MESSAGE_PAGE_SIZE,
  type ContactMessageListQuery,
} from "@/validations/contact-message";

export function ContactMessagesTable({
  messages,
  total,
  totalPages,
  query,
}: {
  messages: ContactMessage[];
  total: number;
  totalPages: number;
  query: ContactMessageListQuery;
}) {
  const [viewId, setViewId] = useState<string | null>(null);

  return (
    <AdminDataTable
      filters={<ContactMessagesFilters query={query} />}
      header={
        <TableRow>
          <TableHead className="pl-4">Name</TableHead>
          <TableHead>Route</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Submitted</TableHead>
          <TableHead className="w-28 pr-4 text-right">Actions</TableHead>
        </TableRow>
      }
      isEmpty={messages.length === 0}
      emptyColSpan={7}
      empty={
        <AdminEmptyState
          icon={MailIcon}
          title="No messages found"
          description="Try changing the search, or wait for new submissions from the contact form."
        />
      }
      pagination={{
        basePath: ROUTES.contactUs,
        page: query.page,
        pageSize: CONTACT_MESSAGE_PAGE_SIZE,
        total,
        totalPages,
        filters: {
          search: query.search,
          enquiryType:
            query.enquiryType === "all" ? undefined : query.enquiryType,
        },
      }}
    >
      {messages.map((message) => (
        <TableRow
          key={message.id}
          className="cursor-pointer"
          onClick={() => setViewId(message.id)}
        >
          <TableCell className="max-w-[10rem] truncate pl-4 font-medium sm:max-w-[14rem]">
            {message.full_name}
          </TableCell>
          <TableCell>
            <Badge variant="secondary" className="whitespace-nowrap">
              {CONTACT_ENQUIRY_ADMIN_LABELS[message.enquiry_type]}
            </Badge>
          </TableCell>
          <TableCell className="max-w-[11rem] truncate sm:max-w-[16rem]">
            {message.email}
          </TableCell>
          <TableCell className="whitespace-nowrap">{message.phone}</TableCell>
          <TableCell className="max-w-[12rem] truncate sm:max-w-[18rem]">
            {message.subject}
          </TableCell>
          <TableCell className="whitespace-nowrap text-muted-foreground">
            {formatAdminDate(message.created_at)}
          </TableCell>
          <TableCell
            className="pr-4"
            onClick={(event) => event.stopPropagation()}
          >
            <ContactMessageRowActions
              message={message}
              viewOpen={viewId === message.id}
              onViewOpenChange={(open) =>
                setViewId(open ? message.id : null)
              }
            />
          </TableCell>
        </TableRow>
      ))}
    </AdminDataTable>
  );
}
